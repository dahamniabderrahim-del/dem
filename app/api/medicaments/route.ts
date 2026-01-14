import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

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
    const category = searchParams.get('category');

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const medicaments = await prisma.medicament.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(medicaments);
  } catch (error) {
    console.error('Error fetching medicaments:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des médicaments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, category, description, unit, stock, minStock, price, expiryDate, supplier } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom du médicament est requis' },
        { status: 400 }
      );
    }

    const medicament = await prisma.medicament.create({
      data: {
        name,
        category: category || null,
        description: description || null,
        unit: unit || null,
        stock: stock || 0,
        minStock: minStock || 0,
        price: price ? parseFloat(price) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplier: supplier || null,
      },
    });

    return NextResponse.json(medicament, { status: 201 });
  } catch (error) {
    console.error('Error creating medicament:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création du médicament' },
      { status: 500 }
    );
  }
}














