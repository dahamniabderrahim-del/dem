# 📋 Structure des Rendez-vous et Consultations

## Concept

### Rendez-vous (Appointment)
- **Géré par** : Réceptionniste
- **Relation** : `Receptionist` ↔ `Patient`
- **Rôle** : Prise de rendez-vous, organisation, planning
- **Table** : `appointments`

### Consultation (Consultation)
- **Effectuée par** : Médecin
- **Relation** : `Doctor` ↔ `Patient`
- **Rôle** : Consultation médicale, diagnostic, traitement
- **Table** : `consultations`

## Structure de la base de données

### Table `appointments` (Rendez-vous)
```prisma
model Appointment {
  id             String
  patientId      String  // Patient
  receptionistId String  // Réceptionniste qui gère le rendez-vous
  date           DateTime
  time           String
  duration       Int
  status         AppointmentStatus
  reason         String?
  notes          String?
  consultations  Consultation[] // Un rendez-vous peut mener à une consultation
}
```

**Utilisation** :
- Les réceptionnistes créent et gèrent les rendez-vous
- Un rendez-vous peut être transformé en consultation par un médecin
- Les rendez-vous sont pour la planification et l'organisation

### Table `consultations` (Consultation)
```prisma
model Consultation {
  id           String
  patientId    String  // Patient
  doctorId     String  // Médecin qui effectue la consultation
  appointmentId String? // Optionnel - peut être liée à un rendez-vous
  date         DateTime
  time         String
  duration     Int
  status       String
  reason       String?
  diagnosis    String? // Diagnostic du médecin
  notes        String? // Notes de consultation
  medicalRecords MedicalRecord[]
}
```

**Utilisation** :
- Les médecins créent et gèrent les consultations
- Une consultation peut être liée à un rendez-vous (le patient vient pour son rendez-vous)
- Les consultations contiennent le diagnostic et les notes médicales
- Les consultations génèrent des dossiers médicaux

## Flux de travail

1. **Réceptionniste** crée un **Rendez-vous** pour un patient
2. Le patient vient au **Rendez-vous**
3. Le **Médecin** crée une **Consultation** (optionnellement liée au rendez-vous)
4. La **Consultation** génère un **Dossier médical**
5. Le **Médecin** peut créer des **Prescriptions** basées sur la consultation

## Relations

### Rendez-vous → Consultation
- Un rendez-vous peut mener à une consultation
- `Consultation.appointmentId` référence `Appointment.id`

### Consultation → Dossier médical
- Une consultation génère un dossier médical
- `MedicalRecord.consultationId` référence `Consultation.id`

### Consultation → Prescription
- Une consultation peut générer des prescriptions
- `Prescription` peut être liée à un `MedicalRecord` qui vient d'une consultation

## Différences clés

| Aspect | Rendez-vous (Appointment) | Consultation (Consultation) |
|--------|---------------------------|----------------------------|
| **Géré par** | Réceptionniste | Médecin |
| **Relation** | Receptionist ↔ Patient | Doctor ↔ Patient |
| **Objectif** | Planification, organisation | Soins médicaux, diagnostic |
| **Contenu** | Date, heure, raison | Diagnostic, notes médicales |
| **Peut générer** | Consultation | Dossier médical, Prescriptions |

## Migration

Pour appliquer ces changements :

1. **Générer la migration** :
   ```bash
   npx prisma migrate dev --name separate_appointments_consultations
   ```

2. **Ou pousser directement** :
   ```bash
   npx prisma db push
   ```

3. **Régénérer le client Prisma** :
   ```bash
   npm run db:generate
   ```

## Notes importantes

- Les rendez-vous sont gérés par les réceptionnistes (planification)
- Les consultations sont effectuées par les médecins (soins)
- Un rendez-vous peut mener à une consultation
- Les dossiers médicaux sont liés aux consultations, pas aux rendez-vous
- Les factures peuvent être liées soit à un rendez-vous, soit à une consultation













