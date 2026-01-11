# 💊 Guide : Médicaments et Prescriptions

## 📋 Structure de la Base de Données

### Table `medicaments`
Gère le stock de médicaments de la clinique.

**Attributs :**
- `id` (UUID, Primary Key)
- `name` (String) - Nom du médicament *
- `category` (String, nullable) - Catégorie (Antalgique, Antibiotique, etc.)
- `description` (String, nullable) - Description
- `unit` (String, nullable) - Unité (mg, ml, etc.)
- `stock` (Int) - Stock disponible (défaut: 0)
- `minStock` (Int) - Stock minimum (défaut: 0)
- `price` (Decimal, nullable) - Prix unitaire
- `expiryDate` (Date, nullable) - Date d'expiration
- `supplier` (String, nullable) - Fournisseur
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `name`, `category`

### Table `prescriptions`
Prescriptions médicales.

**Attributs :**
- `id` (UUID, Primary Key)
- `medical_record_id` (UUID, nullable) - Lien vers dossier médical
- `dosage` (String) - Dosage *
- `frequency` (String) - Fréquence *
- `duration` (String) - Durée *
- `instructions` (String, nullable) - Instructions spéciales
- `prescribed_by` (String, nullable) - ID du médecin
- `created_at` (DateTime)

**Relations :**
- Many-to-Many avec `patients` (via `patient_prescription`)
- Many-to-Many avec `medicaments` (via `prescription_medicament`)
- Many-to-One avec `medical_records` (optionnel)

### Table `prescription_medicament`
Table de jonction Many-to-Many : Prescription ↔ Medicament

**Attributs :**
- `id` (UUID, Primary Key)
- `prescription_id` (UUID, Foreign Key)
- `medicament_id` (UUID, Foreign Key)
- `quantity` (Int) - Quantité prescrite (défaut: 1)
- `dosage` (String, nullable) - Dosage spécifique
- `created_at` (DateTime)

**Contrainte unique :** (`prescription_id`, `medicament_id`)

### Table `patient_prescription`
Table de jonction Many-to-Many : Patient ↔ Prescription

**Attributs :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key)
- `prescription_id` (UUID, Foreign Key)
- `prescribed_date` (DateTime) - Date de prescription
- `status` (String, nullable) - 'active', 'completed', 'cancelled'
- `notes` (String, nullable)
- `created_at` (DateTime)

**Contrainte unique :** (`patient_id`, `prescription_id`)

## 🔗 Relations

### Prescription ↔ Patient (Many-to-Many)
- Une prescription peut être prescrite à plusieurs patients
- Un patient peut avoir plusieurs prescriptions
- Via la table `patient_prescription`

### Prescription ↔ Medicament (Many-to-Many)
- Une prescription peut contenir plusieurs médicaments
- Un médicament peut être dans plusieurs prescriptions
- Via la table `prescription_medicament`

## 📝 Utilisation

### Créer une prescription avec médicaments

```typescript
const prescription = await prisma.prescription.create({
  data: {
    dosage: '500mg',
    frequency: '3 fois par jour',
    duration: '7 jours',
    instructions: 'Prendre après les repas',
    patients: {
      create: {
        patientId: 'patient-id',
        status: 'active',
      },
    },
    medicaments: {
      create: [
        {
          medicamentId: 'medicament-1-id',
          quantity: 1,
          dosage: '500mg',
        },
        {
          medicamentId: 'medicament-2-id',
          quantity: 2,
          dosage: '250mg',
        },
      ],
    },
  },
});
```

### Récupérer les prescriptions d'un patient avec médicaments

```typescript
const prescriptions = await prisma.prescription.findMany({
  where: {
    patients: {
      some: {
        patientId: 'patient-id',
      },
    },
  },
  include: {
    patients: {
      include: {
        patient: true,
      },
    },
    medicaments: {
      include: {
        medicament: true,
      },
    },
  },
});
```

## 🎯 Pages Créées

### `/dashboard/prescriptions`
- Liste toutes les prescriptions
- Affiche le patient, les médicaments, dosage, fréquence, durée
- Formulaire de création avec :
  - Sélection du patient
  - Recherche et sélection de médicaments (multi-sélection)
  - Dosage, fréquence, durée
  - Instructions

### `/dashboard/medicaments`
- Liste tous les médicaments
- Gestion du stock (affichage si stock faible)
- Création/Modification/Suppression (Admin et Médecin)
- Recherche par nom ou catégorie

## 🔐 Permissions

- **Voir les prescriptions :** Tous les utilisateurs authentifiés
- **Créer des prescriptions :** Admin, Médecin, Réceptionniste
- **Voir les médicaments :** Tous les utilisateurs authentifiés
- **Gérer les médicaments :** Admin, Médecin
- **Supprimer les médicaments :** Admin uniquement

## 📊 Données de Test

Après avoir exécuté `npm run db:seed`, vous aurez :
- 4 médicaments de test (Paracétamol, Ibuprofène, Amoxicilline, Aspirine)
- Prêts à être utilisés dans les prescriptions

## ✅ Fonctionnalités

1. ✅ Table `medicaments` créée avec tous les attributs
2. ✅ Relation Many-to-Many Prescription ↔ Medicament
3. ✅ Relation Many-to-Many Prescription ↔ Patient
4. ✅ Page de gestion des médicaments
5. ✅ Page de prescriptions avec sélection patient et médicaments
6. ✅ API routes pour médicaments et prescriptions
7. ✅ Services TypeScript pour les appels API













