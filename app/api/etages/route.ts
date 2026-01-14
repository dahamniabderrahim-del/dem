import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les étages
export async function GET(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const etages = await prisma.etage.findMany({
      include: {
        blocs: {
          include: {
            salles: true,
          },
        },
      },
      orderBy: [
        { floorNumber: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(etages);
  } catch (error) {
    console.error('Error fetching etages:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des étages' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel étage (seulement admin)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Seuls les admins peuvent créer des étages
  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Seuls les administrateurs peuvent créer des étages' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description, floorNumber } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de l\'étage est requis' },
        { status: 400 }
      );
    }

    console.log('📝 Création d\'un nouvel étage:', { name, floorNumber });

    const etage = await prisma.etage.create({
      data: {
        name,
        description: description || null,
        floorNumber: floorNumber !== undefined ? parseInt(floorNumber) : null,
      },
    });

    console.log('✅ Étage créé avec succès:', etage.id);

    return NextResponse.json(etage, { status: 201 });
  } catch (error: any) {
    console.error('Error creating etage:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'Un étage avec ce nom existe déjà' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Erreur lors de la création de l\'étage' },
      { status: 500 }
    );
  }
}

