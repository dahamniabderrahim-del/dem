import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les blocs
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    // Vérifier que prisma.bloc existe
    if (!prisma.bloc) {
      console.error('Prisma client does not have bloc model. Please run: npx prisma generate');
      return NextResponse.json(
        { message: 'Modèle Bloc non disponible. Veuillez régénérer le client Prisma.' },
        { status: 500 }
      );
    }

    const blocs = await prisma.bloc.findMany({
      include: {
        etage: true,
        salles: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(blocs);
  } catch (error: any) {
    console.error('Error fetching blocs:', error);
    // Si la table n'existe pas, retourner un tableau vide au lieu d'une erreur
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('Table blocs does not exist yet, returning empty array');
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des blocs' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau bloc (admin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs peuvent créer des blocs' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, location, etageId } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom du bloc est requis' },
        { status: 400 }
      );
    }

    if (!etageId) {
      return NextResponse.json(
        { message: 'L\'étage est requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'étage existe
    const etage = await prisma.etage.findUnique({
      where: { id: etageId },
    });

    if (!etage) {
      return NextResponse.json(
        { message: 'Étage non trouvé' },
        { status: 404 }
      );
    }

    console.log('📝 Création d\'un nouveau bloc:', { name, etageId });

    const bloc = await prisma.bloc.create({
      data: {
        name,
        description: description || null,
        location: location || null,
        etageId,
      },
    });

    console.log('✅ Bloc créé avec succès:', bloc.id);

    return NextResponse.json(bloc, { status: 201 });
  } catch (error) {
    console.error('Error creating bloc:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du bloc' },
      { status: 500 }
    );
  }
}

