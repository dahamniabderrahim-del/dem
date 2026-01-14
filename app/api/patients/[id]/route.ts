import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';

// GET - Récupérer un patient par ID
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
    const patient = await prisma.patient.findUnique({
      where: { id: params.id },
      include: {
        medicalRecord: {
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
        },
        appointments: {
          include: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
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
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération du patient' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un patient
export async function PUT(
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

  // Seuls admin, médecin, réceptionniste et infirmier peuvent modifier des patients
  if (!['admin', 'medecin', 'receptionniste', 'infirmier'].includes(user.role)) {
    return NextResponse.json(
      { message: 'Non autorisé' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    const { firstName, lastName, dateOfBirth, gender, phone, email, address, insuranceNumber } = data;

    // Vérifier que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le patient
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender && { gender: gender as 'M' | 'F' | 'Autre' }),
        ...(phone && { phone }),
        ...(email !== undefined && { email: email || null }),
        ...(address !== undefined && { address: address || null }),
        ...(insuranceNumber !== undefined && { insuranceNumber: insuranceNumber || null }),
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour du patient' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un patient (seulement admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = verifyAuth(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs peuvent supprimer des patients' },
      { status: 403 }
    );
  }

  try {
    // Vérifier que le patient existe
    const existingPatient = await prisma.patient.findUnique({
      where: { id: params.id },
    });

    if (!existingPatient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le patient (les relations seront supprimées en cascade)
    await prisma.patient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Patient supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la suppression du patient' },
      { status: 500 }
    );
  }
}
