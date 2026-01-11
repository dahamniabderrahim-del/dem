import { prisma } from './prisma';

/**
 * Met à jour automatiquement le statut des prescriptions expirées
 * À appeler périodiquement (ex: via un cron job)
 */
export async function updateExpiredPrescriptions() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Trouver toutes les prescriptions actives qui ont expiré
    const expiredPrescriptions = await prisma.patientPrescription.findMany({
      where: {
        status: 'active',
        expirationDate: {
          lte: today,
        },
      },
    });

    // Mettre à jour le statut
    if (expiredPrescriptions.length > 0) {
      await prisma.patientPrescription.updateMany({
        where: {
          id: {
            in: expiredPrescriptions.map((pp) => pp.id),
          },
        },
        data: {
          status: 'expired',
        },
      });

      console.log(
        `✅ ${expiredPrescriptions.length} prescription(s) marquée(s) comme expirée(s)`
      );
    }

    return {
      updated: expiredPrescriptions.length,
    };
  } catch (error) {
    console.error('Error updating expired prescriptions:', error);
    throw error;
  }
}













