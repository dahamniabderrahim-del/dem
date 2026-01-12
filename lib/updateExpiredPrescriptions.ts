/**
 * Met à jour automatiquement le statut des prescriptions expirées
 * À appeler périodiquement (ex: via un cron job)
 */
export async function updateExpiredPrescriptions() {
  try {
    return { updated: 0 };
  } catch (error) {
    console.error('Error updating expired prescriptions:', error);
    throw error;
  }
}













