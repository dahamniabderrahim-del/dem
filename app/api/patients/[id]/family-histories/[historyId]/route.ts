import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// PUT - Mettre à jour un antécédent familial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; historyId: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const history = await prisma.familyHistory.update({
      where: { id: params.historyId },
      data: {
        ...data,
        ageAtOnset: data.ageAtOnset ? parseInt(data.ageAtOnset) : null,
      },
    });
    return NextResponse.json(history);
  } catch (error: any) {
    console.error('Error updating family history:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Antécédent non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un antécédent familial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; historyId: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.familyHistory.delete({ where: { id: params.historyId } });
    return NextResponse.json({ message: 'Antécédent supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting family history:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Antécédent non trouvé' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}












