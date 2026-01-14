import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// PUT - Mettre à jour une allergie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; allergyId: string } }
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
    const allergy = await prisma.allergy.update({
      where: { id: params.allergyId },
      data,
    });
    return NextResponse.json(allergy);
  } catch (error: any) {
    console.error('Error updating allergy:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Allergie non trouvée' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une allergie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; allergyId: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.allergy.delete({ where: { id: params.allergyId } });
    return NextResponse.json({ message: 'Allergie supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting allergy:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ message: 'Allergie non trouvée' }, { status: 404 });
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}













