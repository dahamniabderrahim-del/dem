import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Recherche globale dans tous les éléments
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
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        patients: [],
        appointments: [],
        prescriptions: [],
        medicaments: [],
      });
    }

    const searchTerm = query.trim().toLowerCase();

    // Recherche dans les patients
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    });

    // Recherche dans les rendez-vous
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          {
            patient: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
          {
            doctor: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
          { reason: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 10,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Recherche dans les médicaments
    const medicaments = await prisma.medicament.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        stock: true,
      },
    });

    // Recherche dans les prescriptions (via patients)
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patients: {
          some: {
            patient: {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
      },
      take: 10,
      include: {
        patients: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        medicaments: {
          include: {
            medicament: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      patients,
      appointments,
      prescriptions,
      medicaments,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}












