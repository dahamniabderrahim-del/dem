# 💊 Relation Many-to-Many : Prescription ↔ Patient

## 📋 Structure

Une relation many-to-many a été ajoutée entre les **Prescriptions** et les **Patients** via la table de jonction `patient_prescription`.

## 🗄️ Tables

### Table `prescriptions`
- `id` (UUID, Primary Key)
- `medical_record_id` (UUID, Foreign Key → `medical_records`, **optionnel maintenant**)
- `medication` (String)
- `dosage` (String)
- `frequency` (String)
- `duration` (String)
- `instructions` (String, nullable)
- `created_at` (DateTime)

### Table `patient_prescription` (Table de jonction)
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `prescription_id` (UUID, Foreign Key → `prescriptions`)
- `prescribed_date` (DateTime) - Date de prescription
- `status` (String, nullable) - 'active', 'completed', 'cancelled'
- `notes` (String, nullable)
- `created_at` (DateTime)

**Contrainte unique :** (`patient_id`, `prescription_id`)

## 🔗 Relations

### Prescription ↔ Patient
- **Many-to-Many** via la table `patient_prescription`
- Une prescription peut être prescrite à plusieurs patients
- Un patient peut avoir plusieurs prescriptions

### Prescription ↔ MedicalRecord (optionnel)
- **Many-to-One** (optionnel)
- Une prescription peut être liée à un dossier médical (historique)
- `medical_record_id` est maintenant **optionnel**

## 📝 Utilisation avec Prisma

### Créer une prescription pour un patient

```typescript
// Créer une prescription
const prescription = await prisma.prescription.create({
  data: {
    medication: 'Paracétamol',
    dosage: '500mg',
    frequency: '3 fois par jour',
    duration: '7 jours',
    instructions: 'Prendre après les repas',
  },
});

// Lier la prescription à un patient
await prisma.patientPrescription.create({
  data: {
    patientId: patient.id,
    prescriptionId: prescription.id,
    prescribedDate: new Date(),
    status: 'active',
    notes: 'Prescription initiale',
  },
});
```

### Récupérer toutes les prescriptions d'un patient

```typescript
const patient = await prisma.patient.findUnique({
  where: { id: patientId },
  include: {
    prescriptions: {
      include: {
        prescription: true,
      },
    },
  },
});

// Accéder aux prescriptions
patient.prescriptions.forEach((pp) => {
  console.log(pp.prescription.medication);
  console.log(pp.status);
  console.log(pp.prescribedDate);
});
```

### Récupérer tous les patients d'une prescription

```typescript
const prescription = await prisma.prescription.findUnique({
  where: { id: prescriptionId },
  include: {
    patients: {
      include: {
        patient: true,
      },
    },
  },
});

// Accéder aux patients
prescription.patients.forEach((pp) => {
  console.log(pp.patient.firstName, pp.patient.lastName);
  console.log(pp.status);
});
```

### Mettre à jour le statut d'une prescription pour un patient

```typescript
await prisma.patientPrescription.update({
  where: {
    patientId_prescriptionId: {
      patientId: patientId,
      prescriptionId: prescriptionId,
    },
  },
  data: {
    status: 'completed',
    notes: 'Traitement terminé',
  },
});
```

### Supprimer une prescription pour un patient

```typescript
await prisma.patientPrescription.delete({
  where: {
    patientId_prescriptionId: {
      patientId: patientId,
      prescriptionId: prescriptionId,
    },
  },
});
```

## 🎯 Avantages de cette structure

1. **Flexibilité** : Une même prescription peut être réutilisée pour plusieurs patients
2. **Historique** : Suivi de qui a reçu quelle prescription et quand
3. **Statut individuel** : Chaque patient peut avoir un statut différent pour la même prescription
4. **Notes personnalisées** : Notes spécifiques par patient
5. **Compatibilité** : La relation avec `MedicalRecord` reste disponible pour l'historique

## 📊 Exemple de données

```typescript
// Prescription générique
Prescription {
  id: "presc-1",
  medication: "Paracétamol",
  dosage: "500mg",
  frequency: "3 fois/jour",
  duration: "7 jours"
}

// Lien Patient 1
PatientPrescription {
  patientId: "patient-1",
  prescriptionId: "presc-1",
  prescribedDate: "2024-01-15",
  status: "active"
}

// Lien Patient 2 (même prescription)
PatientPrescription {
  patientId: "patient-2",
  prescriptionId: "presc-1",
  prescribedDate: "2024-01-20",
  status: "completed"
}
```

## 🔄 Migration appliquée

La migration a été appliquée avec `prisma db push`. La table `patient_prescription` a été créée dans votre base de données Supabase.

## ✅ Vérification

Pour vérifier que la table existe :

```sql
SELECT * FROM patient_prescription;
```

Ou dans Prisma Studio :

```bash
npm run db:studio
```














