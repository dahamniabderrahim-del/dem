import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer tous les antécédents familiaux d'un patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
  }

  try {
    const histories = await prisma.familyHistory.findMany({
      where: { patientId: params.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(histories);
  } catch (error: any) {
    console.error('Error fetching family histories:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel antécédent familial
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
    const { relation, condition, description, ageAtOnset, notes } = data;

    if (!relation || !condition) {
      return NextResponse.json(
        { message: 'La relation et la condition sont requises' },
        { status: 400 }
      );
    }

    const history = await prisma.familyHistory.create({
      data: {
        patientId: params.id,
        relation,
        condition,
        description: description || null,
        ageAtOnset: ageAtOnset || null,
        notes: notes || null,
      },
    });

    return NextResponse.json(history, { status: 201 });
  } catch (error: any) {
    console.error('Error creating family history:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}













