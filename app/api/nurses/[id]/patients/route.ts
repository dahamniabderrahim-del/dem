import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer les patients assignés à une infirmière
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

  // Seuls admin et médecin peuvent voir les affectations
  if (!['admin', 'medecin'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 403 }
    );
  }

  try {
    const patientNurses = await prisma.patientNurse.findMany({
      where: { nurseId: params.id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
    });

    return NextResponse.json(patientNurses);
  } catch (error) {
    console.error('Error fetching nurse patients:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des patients' },
      { status: 500 }
    );
  }
}













