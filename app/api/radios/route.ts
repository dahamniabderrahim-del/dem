import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste toutes les radios
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
    const search = searchParams.get('search');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const radios = await prisma.radio.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(radios);
  } catch (error: any) {
    console.error('Error fetching radios:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des radios' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle radio (admin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Seul l'admin peut créer/modifier les radios
  if (user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de la radio est requis' },
        { status: 400 }
      );
    }

    const radio = await prisma.radio.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(radio, { status: 201 });
  } catch (error: any) {
    console.error('Error creating radio:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création de la radio' },
      { status: 500 }
    );
  }
}












