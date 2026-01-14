import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Document supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Document non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}













