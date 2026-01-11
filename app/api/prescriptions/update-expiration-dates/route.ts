import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/appointmentHelpers';
import { calculateExpirationDate } from '@/lib/prescriptionUtils';

/**
 * Route pour mettre à jour les dates d'expiration des prescriptions existantes
 * qui n'ont pas de date d'expiration calculée
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer toutes les prescriptions actives sans date d'expiration
    const prescriptionsWithoutExpiration = await prisma.patientPrescription.findMany({
      where: {
        status: 'active',
        expirationDate: null,
      },
      include: {
        prescription: {
          select: {
            duration: true,
          },
        },
      },
    });

    let updated = 0;
    const today = new Date();

    // Mettre à jour chaque prescription
    for (const patientPrescription of prescriptionsWithoutExpiration) {
      if (patientPrescription.prescription.duration) {
        const expirationDate = calculateExpirationDate(
          patientPrescription.prescribedDate,
          patientPrescription.prescription.duration
        );

        // Mettre à jour le statut si la prescription a expiré
        let status = patientPrescription.status;
        if (expirationDate < today) {
          status = 'expired';
        }

        await prisma.patientPrescription.update({
          where: { id: patientPrescription.id },
          data: {
            expirationDate,
            status,
          },
        });

        updated++;
      }
    }

    return NextResponse.json({
      message: `${updated} prescription(s) mise(s) à jour`,
      updated,
    });
  } catch (error) {
    console.error('Error updating expiration dates:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}













