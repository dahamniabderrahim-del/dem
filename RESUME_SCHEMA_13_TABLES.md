# 📊 Résumé du Schéma - 19 Tables

## Liste des 19 tables

### Tables de base (11 tables)
1. **admins** - Administrateurs
2. **receptionists** - Réceptionnistes
3. **patients** - Patients
4. **doctors** - Médecins
5. **nurses** - Infirmières
6. **prescriptions** - Ordonnances médicales
7. **medicaments** - Médicaments
8. **radios** - Types de radios/examens radiologiques
9. **operations** - Types d'opérations chirurgicales
10. **medical_records** - Dossiers médicaux
11. **blocs** - Blocs (salles/blocs médicaux)

### Tables de jonction Many-to-Many (8 tables)
11. **appointments** - Rendez-vous (Receptionist ↔ Patient) + Attributs de consultation (One-to-One)
12. **prescription_medicament** - Prescription ↔ Medicament
13. **appointment_radio** - Appointment (Rendez-vous/Consultation) ↔ Radio
14. **appointment_operation** - Appointment (Rendez-vous/Consultation) ↔ Operation
15. **doctor_nurse** - Doctor ↔ Nurse (Infirmière ↔ Médecin)
16. **patient_nurse** - Patient ↔ Nurse (Patient ↔ Infirmière)
17. **medical_record_radio** - MedicalRecord ↔ Radio (Dossier médical ↔ Radio)
18. **medical_record_operation** - MedicalRecord ↔ Operation (Dossier médical ↔ Operation)

**Total : 19 tables**

> **Note importante** : La consultation n'est **pas une table séparée**. C'est un **attribut dans la table rendez-vous** (One-to-One). Chaque rendez-vous peut avoir des attributs de consultation (diagnosis, consultationNotes).

## Relations

### Many-to-Many (via tables de jonction)

1. **Receptionist ↔ Patient** → `appointments` (Rendez-vous)
   - Un réceptionniste gère plusieurs rendez-vous
   - Un patient a plusieurs rendez-vous

2. **Prescription ↔ Medicament** → `prescription_medicament`
   - Une prescription contient plusieurs médicaments
   - Un médicament peut être dans plusieurs prescriptions

3. **Appointment ↔ Radio** → `appointment_radio`
   - Un rendez-vous/consultation peut nécessiter plusieurs radios
   - Une radio peut être demandée dans plusieurs rendez-vous/consultations

4. **Appointment ↔ Operation** → `appointment_operation`
   - Un rendez-vous/consultation peut nécessiter plusieurs opérations
   - Une opération peut être demandée dans plusieurs rendez-vous/consultations

5. **Doctor ↔ Nurse** → `doctor_nurse`
   - Un médecin peut travailler avec plusieurs infirmières
   - Une infirmière peut travailler avec plusieurs médecins

6. **Patient ↔ Nurse** → `patient_nurse`
   - Un patient peut être suivi par plusieurs infirmières
   - Une infirmière peut suivre plusieurs patients

7. **MedicalRecord ↔ Radio** → `medical_record_radio`
   - Un dossier médical peut contenir plusieurs radios
   - Une radio peut être dans plusieurs dossiers médicaux

8. **MedicalRecord ↔ Operation** → `medical_record_operation`
   - Un dossier médical peut contenir plusieurs opérations
   - Une opération peut être dans plusieurs dossiers médicaux

### Many-to-One

- **Appointment → Doctor**
   - Chaque rendez-vous a un médecin assigné (`doctorId`)
   - Un médecin peut avoir plusieurs rendez-vous
   - Relation : `Appointment.doctorId` → `Doctor.id`

- **Appointment → Prescription**
   - Chaque rendez-vous/consultation peut avoir une prescription (`prescriptionId`)
   - Une prescription peut avoir plusieurs rendez-vous/consultations
   - Relation : `Appointment.prescriptionId` → `Prescription.id`

- **Appointment → Bloc**
   - Chaque rendez-vous peut être assigné à un bloc (`blocId`)
   - Un bloc peut avoir plusieurs rendez-vous
   - Relation : `Appointment.blocId` → `Bloc.id` (One-to-Many : Bloc → Appointment)

## Structure des tables clés

### `appointments` (Rendez-vous)
- `patientId` (FK → patients)
- `receptionistId` (FK → receptionists)
- `doctorId` (FK → doctors) - Many-to-One
- `blocId` (FK → blocs, optionnel) - Many-to-One : un bloc peut avoir plusieurs rendez-vous
- `date`, `time`, `duration`, `status`, `reason`, `notes`
- Attributs de consultation (One-to-One, dans la même table) :
  - `diagnosis` : Diagnostic du médecin
  - `consultationNotes` : Notes de consultation
  - `consultation` : JSON contenant les rapports de consultation (liste d'objets)

### `blocs` (Blocs)
- `name` : Nom du bloc (ex: "Bloc A", "Bloc Chirurgie")
- `description` : Description du bloc
- `location` : Localisation du bloc
- `capacity` : Capacité (nombre de salles)
- Relation One-to-Many avec `appointments` : un bloc peut avoir plusieurs rendez-vous
    - Exemple de structure d'un rapport :
      - `id`: string
      - `date`: date
      - `doctorId`: string (optionnel)
      - `title`: string (optionnel)
      - `diagnosis`: string (optionnel)
      - `summary`: string (optionnel)
      - `notes`: string (optionnel)
      - `vitals`: { temperature, heartRate, respiratoryRate, bloodPressure, spo2, weightKg } (optionnel)
      - `prescriptions`: [{ medicamentId, name?, dosage?, frequency?, duration?, quantity?, instructions? }] (optionnel)
      - `attachments`: [{ id, name, url?, contentType? }] (optionnel)

### `prescriptions`
- `prescribedBy` (FK → doctors)
- `instructions`
- Relation : peut avoir plusieurs rendez-vous/consultations

### `appointment_radio`
- `appointmentId` (FK → appointments)
- `radioId` (FK → radios)
- `results`, `notes`

### `appointment_operation`
- `appointmentId` (FK → appointments)
- `operationId` (FK → operations)
- `date`, `notes`

### `nurses` (Infirmières)
- `email`, `password`, `firstName`, `lastName`, `phone`
- Relations Many-to-Many avec `doctors` et `patients`

### `doctor_nurse`
- `doctorId` (FK → doctors)
- `nurseId` (FK → nurses)
- Relation Many-to-Many : un médecin peut travailler avec plusieurs infirmières

### `patient_nurse`
- `patientId` (FK → patients)
- `nurseId` (FK → nurses)
- Relation Many-to-Many : un patient peut être suivi par plusieurs infirmières

### `patients`
- Relation One-to-One avec le dossier médical : `medicalRecord` (un patient a un seul dossier médical)

### `medical_records` (Dossiers médicaux)
- `patientId` (FK → patients, UNIQUE) - Relation One-to-One : un patient a un seul dossier médical
- `title` : Titre du dossier
- `description` : Description du dossier
- `diagnosis` : Diagnostic
- `symptoms` : Symptômes
- `notes` : Notes du médecin
- Relations Many-to-Many avec `radios` et `operations`

### `medical_record_radio`
- `medicalRecordId` (FK → medical_records)
- `radioId` (FK → radios)
- `results` : Résultats de la radio
- `notes` : Notes supplémentaires
- Relation Many-to-Many : un dossier médical peut contenir plusieurs radios

### `medical_record_operation`
- `medicalRecordId` (FK → medical_records)
- `operationId` (FK → operations)
- `date` : Date de l'opération
- `notes` : Notes sur l'opération
- Relation Many-to-Many : un dossier médical peut contenir plusieurs opérations

## Migration

```bash
# 1. Appliquer le schéma
npx prisma db push

# 2. Régénérer le client Prisma
npm run db:generate
```

## Notes importantes

✅ **18 tables** au total
✅ **Rendez-vous** = relation Receptionist ↔ Patient
✅ **Consultation** = attributs dans la table rendez-vous (One-to-One), **pas une table séparée**
✅ **Dossiers médicaux** = table séparée avec relations Many-to-Many vers Radio et Operation
✅ **Many-to-One** : Appointment → Doctor, Appointment → Prescription, MedicalRecord → Patient
✅ **One-to-One** : Appointment ↔ Consultation (attributs dans la même table), Patient ↔ MedicalRecord
✅ **Many-to-Many** : Prescription ↔ Medicament, Appointment ↔ Radio, Appointment ↔ Operation, Doctor ↔ Nurse, Patient ↔ Nurse, **MedicalRecord ↔ Radio, MedicalRecord ↔ Operation**

