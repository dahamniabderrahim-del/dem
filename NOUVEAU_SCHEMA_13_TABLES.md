# 📊 Nouveau Schéma - 13 Tables

## Structure des tables

### Tables de base (8 tables)

1. **receptionists** - Réceptionnistes
2. **patients** - Patients
3. **doctors** - Médecins
4. **consultations** - Consultations médicales
5. **prescriptions** - Ordonnances médicales
6. **medicaments** - Médicaments
7. **radios** - Types de radios/examens radiologiques
8. **operations** - Types d'opérations chirurgicales

### Tables de jonction Many-to-Many (4 tables)

9. **appointments** - Rendez-vous (Receptionist ↔ Patient)
10. **prescription_medicament** - Prescription ↔ Medicament
11. **consultation_radio** - Consultation ↔ Radio
12. **consultation_operation** - Consultation ↔ Operation

### Table supplémentaire (1 table)

13. **admins** - Administrateurs (si nécessaire)

**Total : 13 tables**

## Relations

### Many-to-Many

1. **Receptionist ↔ Patient** → Table `appointments` (Rendez-vous)
   - Un réceptionniste peut gérer plusieurs rendez-vous
   - Un patient peut avoir plusieurs rendez-vous

2. **Prescription ↔ Medicament** → Table `prescription_medicament`
   - Une prescription peut contenir plusieurs médicaments
   - Un médicament peut être dans plusieurs prescriptions

3. **Consultation ↔ Radio** → Table `consultation_radio`
   - Une consultation peut nécessiter plusieurs radios
   - Une radio peut être demandée dans plusieurs consultations

4. **Consultation ↔ Operation** → Table `consultation_operation`
   - Une consultation peut nécessiter plusieurs opérations
   - Une opération peut être demandée dans plusieurs consultations

### Many-to-One

- **Appointment → Doctor** (via `doctorId`)
   - Chaque rendez-vous a un médecin assigné
   - Un médecin peut avoir plusieurs rendez-vous
   - Relation : `Appointment.doctorId` → `Doctor.id`

### Many-to-One

- **Consultation → Prescription**
   - Chaque consultation a une prescription (`prescriptionId`)
   - Une prescription peut avoir plusieurs consultations
   - Relation : `Consultation.prescriptionId` → `Prescription.id`

## Structure détaillée

### Table `appointments` (Rendez-vous)
```prisma
- id
- patientId (FK → patients)
- receptionistId (FK → receptionists)
- doctorId (FK → doctors) // Many-to-One avec médecin
- date, time, duration
- status, reason, notes
```

### Table `consultations`
```prisma
- id
- patientId (FK → patients)
- doctorId (FK → doctors)
- prescriptionId (FK → prescriptions) // Many-to-One
- date, time, duration
- status, reason, diagnosis, notes
```

### Table `prescriptions`
```prisma
- id
- instructions
- prescribedBy (FK → doctors)
```

### Table `prescription_medicament`
```prisma
- id
- prescriptionId (FK → prescriptions)
- medicamentId (FK → medicaments)
- quantity, dosage, frequency, duration, instructions
```

### Table `consultation_radio`
```prisma
- id
- consultationId (FK → consultations)
- radioId (FK → radios)
- results, notes
```

### Table `consultation_operation`
```prisma
- id
- consultationId (FK → consultations)
- operationId (FK → operations)
- date, notes
```

## Migration

Pour appliquer ce nouveau schéma :

```bash
# 1. Générer la migration
npx prisma migrate dev --name new_13_tables_structure

# Ou pousser directement
npx prisma db push

# 2. Régénérer le client Prisma
npm run db:generate
```

## Notes importantes

- Les rendez-vous sont gérés par les réceptionnistes
- Chaque rendez-vous a un médecin assigné (Many-to-One : un médecin peut avoir plusieurs rendez-vous)
- Les consultations sont effectuées par les médecins
- Chaque consultation est liée à une prescription (Many-to-One)
- Une prescription peut avoir plusieurs consultations
- Les consultations peuvent nécessiter des radios et/ou des opérations

