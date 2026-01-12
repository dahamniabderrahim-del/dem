import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, verifyAppointmentModification } from '@/lib/appointmentHelpers';

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

    const where: any = {};
    if (patientId) {
      where.appointments = {
        some: {
          patientId,
        },
      };
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
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
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                specialty: true,
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
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des prescriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const user = verifyAppointmentModification(request);
  if (!user) {
    return NextResponse.json(
      { message: 'Non autorisé - Seuls les administrateurs et médecins peuvent créer des prescriptions' },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    // Structure attendue:
    // {
    //   patientId: string,
    //   appointmentId?: string,
    //   medicaments: [{ medicamentId, dosage, frequency, duration, quantity, instructions? }],
    //   notes?: string,
    //   instructions?: string
    // }
    const { patientId, appointmentId, medicaments, instructions } = data;

    if (!patientId || !medicaments || !Array.isArray(medicaments) || medicaments.length === 0) {
      return NextResponse.json(
        { message: 'Patient et au moins un médicament sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que chaque médicament a les champs requis
    for (const med of medicaments) {
      if (!med.medicamentId || !med.dosage || !med.frequency || !med.duration) {
        return NextResponse.json(
          { message: 'Chaque médicament doit avoir un dosage, une fréquence et une durée' },
          { status: 400 }
        );
      }
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) {
      return NextResponse.json(
        { message: 'Patient non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que tous les médicaments existent
    const medicamentIds = medicaments.map((m: any) => m.medicamentId);
    const existingMedicaments = await prisma.medicament.findMany({
      where: {
        id: { in: medicamentIds },
      },
    });

    if (existingMedicaments.length !== medicamentIds.length) {
      return NextResponse.json(
        { message: 'Un ou plusieurs médicaments n\'existent pas' },
        { status: 404 }
      );
    }

    const appointment = appointmentId
      ? await prisma.appointment.findUnique({
          where: { id: appointmentId },
        })
      : await prisma.appointment.findFirst({
          where: { patientId },
          orderBy: { date: 'desc' },
        });

    if (!appointment) {
      return NextResponse.json(
        { message: 'Aucun rendez-vous trouvé pour ce patient' },
        { status: 404 }
      );
    }

    // Créer la prescription (ordonnance)
    const prescription = await prisma.$transaction(async (tx) => {
      const created = await tx.prescription.create({
        data: {
          instructions: instructions || null,
          prescribedBy: user.role === 'medecin' ? user.userId : null,
          medicaments: {
            create: medicaments.map((med: any) => ({
              medicamentId: med.medicamentId,
              quantity: med.quantity || 1,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions || null,
            })),
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
              doctor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  specialty: true,
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
      });

      await tx.appointment.update({
        where: { id: appointment.id },
        data: { prescriptionId: created.id },
      });

      return created;
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la prescription' },
      { status: 500 }
    );
  }
}
