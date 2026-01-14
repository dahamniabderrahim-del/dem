import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un examen par ID
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
    const examination = await prisma.examination.findUnique({
      where: { id: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        appointment: {
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    if (!examination) {
      return NextResponse.json(
        { message: 'Examen non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(examination);
  } catch (error: any) {
    console.error('Error fetching examination:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération de l\'examen' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un examen (admin, médecin uniquement)
export async function PUT(
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

  if (user.role !== 'admin' && user.role !== 'medecin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { type, description, results, status, completedDate, notes } = data;

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (results !== undefined) updateData.results = results;
    if (status !== undefined) updateData.status = status;
    if (completedDate !== undefined) updateData.completedDate = completedDate ? new Date(completedDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Si le statut passe à "completed" et qu'il n'y a pas encore de date de complétion
    if (status === 'completed' && !completedDate) {
      updateData.completedDate = new Date();
    }

    const examination = await prisma.examination.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(examination);
  } catch (error: any) {
    console.error('Error updating examination:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Examen non trouvé' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la mise à jour de l\'examen' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un examen (admin uniquement)
export async function DELETE(
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    await prisma.examination.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Examen supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting examination:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { message: 'Examen non trouvé' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la suppression de l\'examen' },
      { status: 500 }
    );
  }
}













