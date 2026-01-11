import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, verifyAppointmentModification } from '@/lib/appointmentHelpers';
import { calculateExpirationDate } from '@/lib/prescriptionUtils';

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
      where.patients = {
        some: {
          patientId,
        },
      };
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patients: {
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
    //   medicaments: [{ medicamentId, dosage, frequency, duration, quantity, instructions? }],
    //   notes?: string,
    //   instructions?: string,
    //   medicalRecordId?: string
    // }
    const { patientId, medicaments, notes, instructions, medicalRecordId } = data;

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

    // Calculer la date d'expiration (utiliser la durée la plus longue parmi les médicaments)
    const prescribedDate = new Date();
    const maxDuration = medicaments.reduce((max: string, med: any) => {
      // Comparaison simple basée sur le nombre de jours
      const currentDays = parseInt(med.duration) || 0;
      const maxDays = parseInt(max) || 0;
      return currentDays > maxDays ? med.duration : max;
    }, medicaments[0].duration);
    const expirationDate = calculateExpirationDate(prescribedDate, maxDuration);

    // Créer la prescription (ordonnance)
    const prescription = await prisma.prescription.create({
      data: {
        instructions: instructions || null,
        medicalRecordId: medicalRecordId || null,
        prescribedBy: user.role === 'medecin' ? user.userId : null,
        patients: {
          create: {
            patientId,
            prescribedDate,
            expirationDate,
            status: 'active',
          },
        },
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
        patients: {
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

