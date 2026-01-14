/**
 * Calcule la date d'expiration d'une prescription à partir de sa durée
 * @param prescribedDate Date de prescription
 * @param duration Durée de la prescription (ex: "7 jours", "2 semaines", "1 mois")
 * @returns Date d'expiration
 */
export function calculateExpirationDate(
  prescribedDate: Date,
  duration: string
): Date {
  const expirationDate = new Date(prescribedDate);
  
  // Parser la durée (ex: "7 jours", "2 semaines", "1 mois")
  const durationLower = duration.toLowerCase().trim();
  
  // Extraire le nombre
  const match = durationLower.match(/(\d+)/);
  if (!match) {
    // Par défaut, 7 jours si la durée n'est pas valide
    expirationDate.setDate(expirationDate.getDate() + 7);
    return expirationDate;
  }
  
  const number = parseInt(match[1], 10);
  
  // Déterminer l'unité
  if (durationLower.includes('jour') || durationLower.includes('day')) {
    expirationDate.setDate(expirationDate.getDate() + number);
  } else if (durationLower.includes('semaine') || durationLower.includes('week')) {
    expirationDate.setDate(expirationDate.getDate() + number * 7);
  } else if (durationLower.includes('mois') || durationLower.includes('month')) {
    expirationDate.setMonth(expirationDate.getMonth() + number);
  } else {
    // Par défaut, considérer comme jours
    expirationDate.setDate(expirationDate.getDate() + number);
  }
  
  return expirationDate;
}

/**
 * Formate le temps relatif (ex: "Il y a 5 min", "Dans 3 jours")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 0) {
    // Passé
    if (Math.abs(diffDays) > 0) {
      return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    } else if (Math.abs(diffHours) > 0) {
      return `Il y a ${Math.abs(diffHours)} heure${Math.abs(diffHours) > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${Math.abs(diffMins)} min`;
    }
  } else {
    // Futur
    if (diffDays > 0) {
      return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Dans ${diffMins} min`;
    }
  }
}














