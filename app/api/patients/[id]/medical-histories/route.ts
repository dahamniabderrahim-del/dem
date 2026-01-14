import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer tous les antécédents médicaux d'un patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const histories = await prisma.medicalHistory.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(histories);
  } catch (error: any) {
    console.error('Error fetching medical histories:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel antécédent médical
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
    const { category, condition, description, startDate, endDate, isActive, notes } = data;

    if (!category || !condition) {
      return NextResponse.json(
        { message: 'La catégorie et la condition sont requises' },
        { status: 400 }
      );
    }

    const history = await prisma.medicalHistory.create({
      data: {
        patientId: params.id,
        category,
        condition,
        description: description || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
      },
    });

    return NextResponse.json(history, { status: 201 });
  } catch (error: any) {
    console.error('Error creating medical history:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}













