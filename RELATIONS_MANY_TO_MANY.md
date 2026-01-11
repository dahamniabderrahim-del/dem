# 📊 Relations Many-to-Many - Documentation

## 🎯 Vue d'ensemble

Le schéma de base de données utilise maintenant des relations **Many-to-Many** entre les différentes entités.

## 🔗 Relations Many-to-Many

### 1. **Doctor ↔ Nurse** (Médecin ↔ Infirmier)
- **Table de jonction** : `doctor_nurse`
- Un médecin peut avoir plusieurs infirmiers
- Un infirmier peut travailler avec plusieurs médecins

```sql
CREATE TABLE "doctor_nurse" (
    "id" TEXT PRIMARY KEY,
    "doctor_id" TEXT REFERENCES doctors(id),
    "nurse_id" TEXT REFERENCES nurses(id),
    "created_at" TIMESTAMP,
    UNIQUE(doctor_id, nurse_id)
);
```

**Exemple d'utilisation** :
```typescript
// Trouver tous les infirmiers d'un médecin
const doctor = await prisma.doctor.findUnique({
  where: { id: doctorId },
  include: { nurses: { include: { nurse: true } } }
});
```

---

### 2. **Doctor ↔ Patient** (Médecin ↔ Patient)
- **Table de jonction** : `appointments` (rendez-vous)
- Un médecin peut avoir plusieurs patients (via rendez-vous)
- Un patient peut avoir plusieurs médecins (via rendez-vous)
- **Note** : La table `appointments` contient des informations supplémentaires (date, heure, raison, etc.)

```sql
CREATE TABLE "appointments" (
    "id" TEXT PRIMARY KEY,
    "patient_id" TEXT REFERENCES patients(id),
    "doctor_id" TEXT REFERENCES doctors(id),
    "date" DATE,
    "time" TEXT,
    "duration" INT,
    "status" AppointmentStatus,
    "reason" TEXT,
    "notes" TEXT,
    ...
);
```

**Exemple d'utilisation** :
```typescript
// Trouver tous les patients d'un médecin (via rendez-vous)
const doctor = await prisma.doctor.findUnique({
  where: { id: doctorId },
  include: { patients: { include: { patient: true } } }
});

// Créer un rendez-vous (relation Doctor ↔ Patient)
const appointment = await prisma.appointment.create({
  data: {
    patientId: patientId,
    doctorId: doctorId,
    date: new Date(),
    time: '09:00',
    status: 'scheduled'
  }
});
```

---

### 3. **Patient ↔ Nurse** (Patient ↔ Infirmier)
- **Table de jonction** : `patient_nurse`
- Un patient peut avoir plusieurs infirmiers
- Un infirmier peut s'occuper de plusieurs patients

```sql
CREATE TABLE "patient_nurse" (
    "id" TEXT PRIMARY KEY,
    "patient_id" TEXT REFERENCES patients(id),
    "nurse_id" TEXT REFERENCES nurses(id),
    "created_at" TIMESTAMP,
    UNIQUE(patient_id, nurse_id)
);
```

**Exemple d'utilisation** :
```typescript
// Associer un infirmier à un patient
await prisma.patientNurse.create({
  data: {
    patientId: patientId,
    nurseId: nurseId
  }
});

// Trouver tous les patients d'un infirmier
const nurse = await prisma.nurse.findUnique({
  where: { id: nurseId },
  include: { patients: { include: { patient: true } } }
});
```

---

### 4. **Patient ↔ Receptionist** (Patient ↔ Réceptionniste)
- **Table de jonction** : `patient_receptionist`
- Un patient peut être géré par plusieurs réceptionnistes
- Un réceptionniste peut gérer plusieurs patients

```sql
CREATE TABLE "patient_receptionist" (
    "id" TEXT PRIMARY KEY,
    "patient_id" TEXT REFERENCES patients(id),
    "receptionist_id" TEXT REFERENCES receptionists(id),
    "created_at" TIMESTAMP,
    UNIQUE(patient_id, receptionist_id)
);
```

**Exemple d'utilisation** :
```typescript
// Associer un réceptionniste à un patient
await prisma.patientReceptionist.create({
  data: {
    patientId: patientId,
    receptionistId: receptionistId
  }
});

// Trouver tous les patients d'un réceptionniste
const receptionist = await prisma.receptionist.findUnique({
  where: { id: receptionistId },
  include: { patients: { include: { patient: true } } }
});
```

## 📋 Schéma des Relations

```
┌─────────┐         ┌──────────────┐         ┌─────────┐
│ Doctor  │─────────│ doctor_nurse │─────────│  Nurse  │
└─────────┘         └──────────────┘         └─────────┘
     │                                              │
     │                                              │
     │                                              │
     │         ┌──────────────┐                    │
     │─────────│ appointments │─────────┐          │
     │         │ (rendez-vous)│         │          │
     │         └──────────────┘         │          │
     │                                  │          │
┌─────────┐                      ┌─────────┐      │
│ Patient │                      │ Patient │      │
└─────────┘                      └─────────┘      │
     │                                  │          │
     │         ┌──────────────┐         │          │
     │─────────│patient_nurse │─────────┘          │
     │         └──────────────┘                    │
     │                                              │
     │         ┌──────────────────┐                │
     └─────────│patient_reception │────────────────┘
               │     ist          │
               └──────────────────┘
                         │
                         │
                  ┌──────────────┐
                  │Receptionist  │
                  └──────────────┘
```

## ✅ Changements Effectués

1. ✅ **Supprimé** `doctorId` de la table `patients` (relation One-to-Many supprimée)
2. ✅ **Créé** table `doctor_nurse` pour relation Many-to-Many Doctor ↔ Nurse
3. ✅ **Créé** table `patient_nurse` pour relation Many-to-Many Patient ↔ Nurse
4. ✅ **Créé** table `patient_receptionist` pour relation Many-to-Many Patient ↔ Receptionist
5. ✅ **Conservé** table `appointments` comme table de jonction Doctor ↔ Patient

## 🚀 Application des Migrations

### Étape 1 : Créer les tables de base (si pas déjà fait)
Exécutez `CREATE_SEPARATE_TABLES.sql` dans Supabase SQL Editor

### Étape 2 : Créer les tables de jonction Many-to-Many
Exécutez `CREATE_MANY_TO_MANY_TABLES.sql` dans Supabase SQL Editor

### Étape 3 : Générer le client Prisma
```bash
npm run db:generate
```

### Étape 4 : Tester les relations
```bash
npm run db:seed
npm run db:studio
```

## 📝 Notes Importantes

1. **Appointments** : La table `appointments` sert à la fois de table de jonction et de stockage des rendez-vous. Elle contient des métadonnées (date, heure, statut, etc.)

2. **Unicité** : Toutes les tables de jonction ont une contrainte `UNIQUE(entité1_id, entité2_id)` pour éviter les doublons

3. **Cascade Delete** : Quand un parent est supprimé, les relations dans les tables de jonction sont automatiquement supprimées

4. **Index** : Des index ont été créés sur les clés étrangères pour améliorer les performances des requêtes

## 🔍 Requêtes Utiles

### Trouver tous les infirmiers d'un médecin
```sql
SELECT n.* 
FROM nurses n
INNER JOIN doctor_nurse dn ON n.id = dn.nurse_id
WHERE dn.doctor_id = 'DOCTOR_ID';
```

### Trouver tous les patients d'un médecin (via rendez-vous)
```sql
SELECT DISTINCT p.* 
FROM patients p
INNER JOIN appointments a ON p.id = a.patient_id
WHERE a.doctor_id = 'DOCTOR_ID';
```

### Trouver tous les patients d'un infirmier
```sql
SELECT p.* 
FROM patients p
INNER JOIN patient_nurse pn ON p.id = pn.patient_id
WHERE pn.nurse_id = 'NURSE_ID';
```

### Compter les relations
```sql
-- Nombre d'infirmiers par médecin
SELECT d.first_name, d.last_name, COUNT(dn.nurse_id) as nurse_count
FROM doctors d
LEFT JOIN doctor_nurse dn ON d.id = dn.doctor_id
GROUP BY d.id, d.first_name, d.last_name;
```

























