import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer une salle par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const salle = await prisma.salle.findUnique({
      where: { id: params.id },
      include: {
        bloc: {
          include: {
            etage: true,
          },
        },
      },
    });

    if (!salle) {
      return NextResponse.json(
        { message: 'Salle non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(salle);
  } catch (error: any) {
    console.error('Error fetching salle:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de la salle' },
      { status: 500 }
    );
  }
}

// PUT - Modifier une salle (Admin uniquement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, capacity, equipment, blocId } = data;

    // Vérifier que la salle existe
    const existingSalle = await prisma.salle.findUnique({
      where: { id: params.id },
    });

    if (!existingSalle) {
      return NextResponse.json(
        { message: 'Salle non trouvée' },
        { status: 404 }
      );
    }

    // Si le bloc est modifié, vérifier qu'il existe
    if (blocId && blocId !== existingSalle.blocId) {
      const bloc = await prisma.bloc.findUnique({
        where: { id: blocId },
      });

      if (!bloc) {
        return NextResponse.json(
          { message: 'Bloc non trouvé' },
          { status: 404 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity) : null;
    if (equipment !== undefined) updateData.equipment = equipment || null;
    if (blocId) updateData.blocId = blocId;

    const updatedSalle = await prisma.salle.update({
      where: { id: params.id },
      data: updateData,
      include: {
        bloc: {
          include: {
            etage: true,
          },
        },
      },
    });

    console.log('✅ Salle modifiée avec succès:', updatedSalle.id);
    return NextResponse.json(updatedSalle);
  } catch (error: any) {
    console.error('Error updating salle:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Une salle avec ce nom existe déjà dans ce bloc' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la modification de la salle' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une salle (Admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 401 }
    );
  }

  try {
    // Vérifier que la salle existe
    const existingSalle = await prisma.salle.findUnique({
      where: { id: params.id },
    });

    if (!existingSalle) {
      return NextResponse.json(
        { message: 'Salle non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des rendez-vous associés
    const appointmentsCount = await prisma.appointment.count({
      where: { salleId: params.id },
    });

    if (appointmentsCount > 0) {
      return NextResponse.json(
        { message: `Impossible de supprimer cette salle. Elle a ${appointmentsCount} rendez-vous associé(s).` },
        { status: 400 }
      );
    }

    await prisma.salle.delete({
      where: { id: params.id },
    });

    console.log('✅ Salle supprimée avec succès:', params.id);
    return NextResponse.json({ message: 'Salle supprimée avec succès' });
  } catch (error: any) {
    console.error('Error deleting salle:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de la salle' },
      { status: 500 }
    );
  }
}













