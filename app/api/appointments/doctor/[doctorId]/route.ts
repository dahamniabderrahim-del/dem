import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les rendez-vous d'un médecin spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: params.doctorId,
      },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            phone: true,
          },
        },
        receptionist: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        etage: {
          select: {
            id: true,
            name: true,
            floorNumber: true,
          },
        },
        bloc: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        salle: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des rendez-vous du médecin' },
      { status: 500 }
    );
  }
}
