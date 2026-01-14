# 📋 Structure des Prescriptions Médicales

## Concept

**Une prescription médicale est une ordonnance donnée par un médecin à un patient.**

Une prescription (ordonnance) peut contenir **plusieurs médicaments**, et chaque médicament a ses propres caractéristiques :
- Dosage (ex: 500mg, 1 comprimé)
- Fréquence (ex: 3 fois par jour, matin et soir)
- Durée (ex: 7 jours, 1 mois)
- Quantité (ex: 2 boîtes)

## Structure de la base de données

### Table `prescriptions` (Ordonnance)
Représente l'ordonnance elle-même :
- `id` : Identifiant unique
- `medicalRecordId` : Lien optionnel vers un dossier médical
- `prescribedBy` : ID du médecin qui prescrit
- `notes` : Notes générales sur l'ordonnance
- `instructions` : Instructions générales pour le patient
- `createdAt` : Date de création
- `updatedAt` : Date de mise à jour

### Table `prescription_medicament` (Détails des médicaments)
Contient les détails de chaque médicament dans l'ordonnance :
- `id` : Identifiant unique
- `prescriptionId` : Lien vers l'ordonnance
- `medicamentId` : Lien vers le médicament
- `quantity` : Quantité prescrite (ex: 2 boîtes)
- `dosage` : Dosage (ex: 500mg, 1 comprimé)
- `frequency` : Fréquence (ex: 3 fois par jour)
- `duration` : Durée du traitement (ex: 7 jours)
- `instructions` : Instructions spécifiques pour ce médicament

### Table `patient_prescription` (Lien Patient ↔ Prescription)
Lien entre un patient et une prescription :
- `id` : Identifiant unique
- `patientId` : ID du patient
- `prescriptionId` : ID de l'ordonnance
- `prescribedDate` : Date de prescription
- `expirationDate` : Date d'expiration calculée
- `status` : Statut (active, completed, cancelled, expired)

## Exemple d'utilisation

### Créer une prescription avec plusieurs médicaments

```typescript
POST /api/prescriptions
{
  "patientId": "patient-123",
  "medicaments": [
    {
      "medicamentId": "med-1",
      "dosage": "500mg",
      "frequency": "3 fois par jour",
      "duration": "7 jours",
      "quantity": 2,
      "instructions": "Prendre après les repas"
    },
    {
      "medicamentId": "med-2",
      "dosage": "1 comprimé",
      "frequency": "matin et soir",
      "duration": "10 jours",
      "quantity": 1
    }
  ],
  "notes": "Traitement pour infection urinaire",
  "instructions": "Boire beaucoup d'eau pendant le traitement"
}
```

## Différence importante

❌ **AVANT (incorrect)** :
- La prescription avait un dosage, une fréquence et une durée globale
- Tous les médicaments partageaient les mêmes valeurs

✅ **MAINTENANT (correct)** :
- La prescription est une ordonnance qui contient plusieurs médicaments
- Chaque médicament a son propre dosage, fréquence et durée
- Plus réaliste et conforme à la pratique médicale

## Migration

Pour appliquer ces changements :

1. **Générer la migration** :
   ```bash
   npx prisma migrate dev --name fix_prescription_structure
   ```

2. **Ou pousser directement** :
   ```bash
   npx prisma db push
   ```

3. **Régénérer le client Prisma** :
   ```bash
   npm run db:generate
   ```

## Notes

- Une prescription peut contenir 1 à N médicaments
- Chaque médicament dans une prescription a ses propres caractéristiques
- La date d'expiration est calculée à partir de la durée la plus longue parmi les médicaments
- Les prescriptions peuvent être liées à un dossier médical ou être indépendantes














