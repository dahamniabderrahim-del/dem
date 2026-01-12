import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un bloc par ID
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
    const bloc = await prisma.bloc.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          select: {
            id: true,
            date: true,
            time: true,
          },
        },
      },
    });

    if (!bloc) {
      return NextResponse.json(
        { message: 'Bloc non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(bloc);
  } catch (error) {
    console.error('Error fetching bloc:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du bloc' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un bloc (admin uniquement)
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
      { message: 'Non autorisé - Seuls les administrateurs peuvent modifier des blocs' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, location, capacity, etageId } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom du bloc est requis' },
        { status: 400 }
      );
    }

    // Vérifier que le bloc existe
    const existingBloc = await prisma.bloc.findUnique({
      where: { id: params.id },
    });

    if (!existingBloc) {
      return NextResponse.json(
        { message: 'Bloc non trouvé' },
        { status: 404 }
      );
    }

    // Si etageId est fourni, vérifier qu'il existe
    if (etageId) {
      const etage = await prisma.etage.findUnique({
        where: { id: etageId },
      });
      if (!etage) {
        return NextResponse.json(
          { message: 'Étage non trouvé' },
          { status: 404 }
        );
      }
    }

    const updateData: any = {
      name,
      description: description || null,
      location: location || null,
    };
    
    if (etageId !== undefined) {
      updateData.etageId = etageId;
    }
    
    // Note: capacity n'existe plus dans le schéma, on l'ignore

    const bloc = await prisma.bloc.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(bloc);
  } catch (error) {
    console.error('Error updating bloc:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du bloc' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un bloc (admin uniquement)
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
      { message: 'Non autorisé - Seuls les administrateurs peuvent supprimer des blocs' },
      { status: 403 }
    );
  }

  try {
    // Vérifier que le bloc existe
    const existingBloc = await prisma.bloc.findUnique({
      where: { id: params.id },
      include: {
        appointments: true,
      },
    });

    if (!existingBloc) {
      return NextResponse.json(
        { message: 'Bloc non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des rendez-vous associés
    if (existingBloc.appointments.length > 0) {
      return NextResponse.json(
        { message: 'Impossible de supprimer ce bloc car il contient des rendez-vous' },
        { status: 400 }
      );
    }

    await prisma.bloc.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Bloc supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting bloc:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du bloc' },
      { status: 500 }
    );
  }
}

