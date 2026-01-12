import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Obtenir un étage par ID
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
    const etage = await prisma.etage.findUnique({
      where: { id: params.id },
      include: {
        blocs: {
          include: {
            salles: true,
          },
        },
      },
    });

    if (!etage) {
      return NextResponse.json(
        { message: 'Étage non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(etage);
  } catch (error) {
    console.error('Error fetching etage:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'étage' },
      { status: 500 }
    );
  }
}

// PUT - Modifier un étage (seulement admin)
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

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Seuls les administrateurs peuvent modifier des étages' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, floorNumber } = data;

    // Vérifier que l'étage existe
    const existingEtage = await prisma.etage.findUnique({
      where: { id: params.id },
    });

    if (!existingEtage) {
      return NextResponse.json(
        { message: 'Étage non trouvé' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (floorNumber !== undefined) updateData.floorNumber = floorNumber !== null ? parseInt(floorNumber) : null;

    const updatedEtage = await prisma.etage.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedEtage);
  } catch (error: any) {
    console.error('Error updating etage:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Un étage avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour de l\'étage' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un étage (seulement admin)
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
      { message: 'Seuls les administrateurs peuvent supprimer des étages' },
      { status: 403 }
    );
  }

  try {
    // Vérifier que l'étage existe
    const etage = await prisma.etage.findUnique({
      where: { id: params.id },
      include: {
        blocs: true,
        appointments: true,
      },
    });

    if (!etage) {
      return NextResponse.json(
        { message: 'Étage non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des blocs ou rendez-vous associés
    if (etage.blocs.length > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer un étage qui contient des blocs' },
        { status: 400 }
      );
    }

    if (etage.appointments.length > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer un étage qui a des rendez-vous associés' },
        { status: 400 }
      );
    }

    await prisma.etage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Étage supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting etage:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression de l\'étage' },
      { status: 500 }
    );
  }
}












