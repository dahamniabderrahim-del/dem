import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  const user = verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        appointments: {
          some: {
            patientId: params.patientId,
          },
        },
      },
      include: {
        appointments: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        medicaments: {
          include: {
            medicament: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des prescriptions' },
      { status: 500 }
    );
  }
}














