import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Liste tous les examens médicaux
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
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (appointmentId) {
      where.appointmentId = appointmentId;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = { contains: type, mode: 'insensitive' };
    }

    const examinations = await prisma.examination.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        requestedDate: 'desc',
      },
    });

    return NextResponse.json(examinations);
  } catch (error: any) {
    console.error('Error fetching examinations:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la récupération des examens' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel examen médical (admin, médecin uniquement)
export async function POST(request: NextRequest) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin' && user.role !== 'medecin') {
    return NextResponse.json(
      { message: 'Non autorisé - Admin ou Médecin requis' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { patientId, appointmentId, type, description, requestedDate, notes } = data;

    if (!patientId || !type || !requestedDate) {
      return NextResponse.json(
        { message: 'Le patient, le type et la date de demande sont requis' },
        { status: 400 }
      );
    }

    const examination = await prisma.examination.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        type,
        description: description || null,
        requestedDate: new Date(requestedDate),
        notes: notes || null,
        status: 'requested',
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(examination, { status: 201 });
  } catch (error: any) {
    console.error('Error creating examination:', error);
    return NextResponse.json(
      { message: error?.message || 'Erreur lors de la création de l\'examen' },
      { status: 500 }
    );
  }
}












