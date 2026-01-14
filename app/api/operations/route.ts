import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste toutes les opérations
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

    const operations = await prisma.operation.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(operations);
  } catch (error: any) {
    console.error('Error fetching operations:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des opérations' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle opération (admin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  // Seul l'admin peut créer/modifier les opérations
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
        { message: 'Le nom de l\'opération est requis' },
        { status: 400 }
      );
    }

    const operation = await prisma.operation.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(operation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating operation:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création de l\'opération' },
      { status: 500 }
    );
  }
}













