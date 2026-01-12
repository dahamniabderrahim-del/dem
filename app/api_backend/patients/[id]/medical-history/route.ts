import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer l'historique médical complet d'un patient
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    // Récupérer le dossier médical principal
    const medicalRecord = await prisma.medicalRecord.findUnique({
      where: { patientId: params.id },
      include: {
        radios: {
          include: {
            radio: true,
          },
        },
        operations: {
          include: {
            operation: true,
          },
        },
      },
    });

    // Récupérer tous les rendez-vous avec consultations, radios, opérations
    const appointments = await prisma.appointment.findMany({
      where: { patientId: params.id },
      include: {
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
        radios: {
          include: {
            radio: true,
          },
        },
        operations: {
          include: {
            operation: true,
          },
        },
        prescription: {
          include: {
            medicaments: {
              include: {
                medicament: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({
      medicalRecord,
      appointments,
    });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de l\'historique médical' },
      { status: 500 }
    );
  }
}
