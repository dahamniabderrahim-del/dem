import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste toutes les salles
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const blocId = searchParams.get('blocId');

    const where: any = {};
    if (blocId) {
      where.blocId = blocId;
    }

    const salles = await prisma.salle.findMany({
      where,
      include: {
        bloc: {
          include: {
            etage: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(salles);
  } catch (error: any) {
    console.error('Error fetching salles:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des salles' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle salle (admin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, capacity, equipment, blocId } = data;

    if (!name || !blocId) {
      return NextResponse.json(
        { message: 'Le nom et le bloc sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que le bloc existe
    const bloc = await prisma.bloc.findUnique({
      where: { id: blocId },
    });

    if (!bloc) {
      return NextResponse.json(
        { message: 'Bloc non trouvé' },
        { status: 404 }
      );
    }

    const salle = await prisma.salle.create({
      data: {
        name,
        description: description || null,
        capacity: capacity ? parseInt(capacity) : null,
        equipment: equipment || null,
        blocId,
      },
    });

    console.log('✅ Salle créée avec succès:', salle.id);
    return NextResponse.json(salle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating salle:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Une salle avec ce nom existe déjà dans ce bloc' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la création de la salle' },
      { status: 500 }
    );
  }
}













