# 📊 Tables de la Base de Données

## Liste complète des tables

Votre base de données PostgreSQL contient **13 tables** organisées en plusieurs catégories :

---

## 👥 Tables des Utilisateurs (4 tables)

### 1. `admins` - Administrateurs
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, hashé avec bcrypt)
- `first_name` (String)
- `last_name` (String)
- `phone` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `email`

---

### 2. `doctors` - Médecins
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, hashé avec bcrypt)
- `first_name` (String)
- `last_name` (String)
- `phone` (String, nullable)
- `specialty` (String, nullable) - Spécialité médicale
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `email`, `specialty`

**Relations :**
- Many-to-Many avec `nurses` (via `doctor_nurse`)
- Many-to-Many avec `patients` (via `appointments`)
- One-to-Many avec `medical_records`

---

### 3. `nurses` - Infirmiers
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, hashé avec bcrypt)
- `first_name` (String)
- `last_name` (String)
- `phone` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `email`

**Relations :**
- Many-to-Many avec `doctors` (via `doctor_nurse`)
- Many-to-Many avec `patients` (via `patient_nurse`)

---

### 4. `receptionists` - Réceptionnistes
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, hashé avec bcrypt)
- `first_name` (String)
- `last_name` (String)
- `phone` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `email`

**Relations :**
- Many-to-Many avec `patients` (via `patient_receptionist`)

---

## 🏥 Tables Médicales (7 tables)

### 5. `patients` - Patients
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `first_name` (String)
- `last_name` (String)
- `date_of_birth` (Date)
- `gender` (Enum: M, F, Autre)
- `phone` (String)
- `email` (String, nullable)
- `address` (String, nullable)
- `insurance_number` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Relations :**
- Many-to-Many avec `doctors` (via `appointments`)
- Many-to-Many avec `nurses` (via `patient_nurse`)
- Many-to-Many avec `receptionists` (via `patient_receptionist`)
- One-to-Many avec `medical_records`
- One-to-Many avec `invoices`

---

### 6. `appointments` - Rendez-vous
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `doctor_id` (UUID, Foreign Key → `doctors`)
- `date` (Date)
- `time` (String, format HH:MM)
- `duration` (Integer, défaut: 30 minutes)
- `status` (Enum: scheduled, completed, cancelled, no_show)
- `reason` (String, nullable)
- `notes` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `patient_id`, `doctor_id`, `date`

**Relations :**
- Many-to-One avec `patients`
- Many-to-One avec `doctors`
- One-to-Many avec `medical_records`
- One-to-Many avec `invoices`

---

### 7. `medical_records` - Dossiers médicaux
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `doctor_id` (UUID, Foreign Key → `doctors`)
- `appointment_id` (UUID, Foreign Key → `appointments`, nullable)
- `diagnosis` (String, nullable)
- `symptoms` (String, nullable)
- `notes` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Index :** `patient_id`, `doctor_id`

**Relations :**
- Many-to-One avec `patients`
- Many-to-One avec `doctors`
- Many-to-One avec `appointments` (nullable)
- One-to-Many avec `prescriptions`
- One-to-Many avec `examinations`

---

### 8. `prescriptions` - Prescriptions
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `medical_record_id` (UUID, Foreign Key → `medical_records`)
- `medication` (String)
- `dosage` (String)
- `frequency` (String)
- `duration` (String)
- `instructions` (String, nullable)
- `created_at` (DateTime)

**Index :** `medical_record_id`

**Relations :**
- Many-to-One avec `medical_records`

---

### 9. `examinations` - Examens médicaux
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `medical_record_id` (UUID, Foreign Key → `medical_records`)
- `type` (String)
- `description` (String, nullable)
- `results` (String, nullable)
- `requested_date` (Date)
- `completed_date` (Date, nullable)
- `status` (Enum: requested, completed, cancelled)

**Index :** `medical_record_id`

**Relations :**
- Many-to-One avec `medical_records`

---

## 💰 Tables Financières (1 table)

### 10. `invoices` - Factures
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `appointment_id` (UUID, Foreign Key → `appointments`, nullable)
- `amount` (Decimal(10, 2))
- `status` (Enum: pending, paid, cancelled)
- `payment_method` (String, nullable)
- `insurance_coverage` (Decimal(10, 2), nullable)
- `created_at` (DateTime)
- `paid_at` (DateTime, nullable)

**Index :** `patient_id`

**Relations :**
- Many-to-One avec `patients`
- Many-to-One avec `appointments` (nullable)

---

## 🔗 Tables de Jonction Many-to-Many (3 tables)

### 11. `doctor_nurse` - Relation Médecin ↔ Infirmier
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `doctor_id` (UUID, Foreign Key → `doctors`)
- `nurse_id` (UUID, Foreign Key → `nurses`)
- `created_at` (DateTime)

**Contraintes :**
- Unique sur (`doctor_id`, `nurse_id`)

**Index :** `doctor_id`, `nurse_id`

---

### 12. `patient_nurse` - Relation Patient ↔ Infirmier
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `nurse_id` (UUID, Foreign Key → `nurses`)
- `created_at` (DateTime)

**Contraintes :**
- Unique sur (`patient_id`, `nurse_id`)

**Index :** `patient_id`, `nurse_id`

---

### 13. `patient_receptionist` - Relation Patient ↔ Réceptionniste
**Colonnes principales :**
- `id` (UUID, Primary Key)
- `patient_id` (UUID, Foreign Key → `patients`)
- `receptionist_id` (UUID, Foreign Key → `receptionists`)
- `created_at` (DateTime)

**Contraintes :**
- Unique sur (`patient_id`, `receptionist_id`)

**Index :** `patient_id`, `receptionist_id`

---

## 📋 Enums définis

### `Gender`
- `M` - Masculin
- `F` - Féminin
- `Autre` - Autre

### `AppointmentStatus`
- `scheduled` - Programmé
- `completed` - Terminé
- `cancelled` - Annulé
- `no_show` - Absent

### `ExaminationStatus`
- `requested` - Demandé
- `completed` - Terminé
- `cancelled` - Annulé

### `InvoiceStatus`
- `pending` - En attente
- `paid` - Payé
- `cancelled` - Annulé

---

## 🔍 Résumé

**Total : 13 tables**
- 4 tables utilisateurs (admins, doctors, nurses, receptionists)
- 7 tables médicales (patients, appointments, medical_records, prescriptions, examinations, invoices)
- 3 tables de jonction (doctor_nurse, patient_nurse, patient_receptionist)

**Total : 4 enums**
- Gender, AppointmentStatus, ExaminationStatus, InvoiceStatus

---

## 📝 Notes importantes

1. **Sécurité** : Tous les mots de passe sont hashés avec bcrypt
2. **Relations** : Les relations Many-to-Many utilisent des tables de jonction dédiées
3. **Cascade** : La plupart des suppressions sont en cascade pour maintenir l'intégrité
4. **Index** : Les colonnes fréquemment recherchées sont indexées pour optimiser les performances
5. **UUID** : Tous les IDs utilisent UUID pour une meilleure sécurité et distribution















