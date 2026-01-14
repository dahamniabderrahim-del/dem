import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer toutes les allergies d'un patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const allergies = await prisma.allergy.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(allergies);
  } catch (error: any) {
    console.error('Error fetching allergies:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des allergies' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle allergie
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || (user.role !== 'admin' && user.role !== 'medecin')) {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { name, type, severity, reaction, notes, isActive } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Le nom de l\'allergie est requis' },
        { status: 400 }
      );
    }

    const allergy = await prisma.allergy.create({
      data: {
        patientId: params.id,
        name,
        type: type || null,
        severity: severity || null,
        reaction: reaction || null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(allergy, { status: 201 });
  } catch (error: any) {
    console.error('Error creating allergy:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création de l\'allergie' },
      { status: 500 }
    );
  }
}













