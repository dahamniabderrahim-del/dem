-- ============================================
-- Script SQL pour créer les tables séparées
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- 1. Créer les enums si ils n'existent pas déjà
DO $$ BEGIN
    CREATE TYPE "Gender" AS ENUM ('M', 'F', 'Autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ExaminationStatus" AS ENUM ('requested', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Créer les tables utilisateurs séparées
CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "doctors" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "nurses" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "nurses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "receptionists" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receptionists_pkey" PRIMARY KEY ("id")
);

-- 3. Créer les tables médicales si elles n'existent pas
CREATE TABLE IF NOT EXISTS "patients" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "insurance_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "medical_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "diagnosis" TEXT,
    "symptoms" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prescriptions" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "examinations" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "results" TEXT,
    "requested_date" DATE NOT NULL,
    "completed_date" DATE,
    "status" "ExaminationStatus" NOT NULL DEFAULT 'requested',
    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "insurance_coverage" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- 4. Créer les tables de jonction Many-to-Many
CREATE TABLE IF NOT EXISTS "doctor_nurse" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "doctor_nurse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "doctor_nurse_doctor_id_nurse_id_key" UNIQUE ("doctor_id", "nurse_id")
);

CREATE TABLE IF NOT EXISTS "patient_nurse" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patient_nurse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "patient_nurse_patient_id_nurse_id_key" UNIQUE ("patient_id", "nurse_id")
);

CREATE TABLE IF NOT EXISTS "patient_receptionist" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "receptionist_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "patient_receptionist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "patient_receptionist_patient_id_receptionist_id_key" UNIQUE ("patient_id", "receptionist_id")
);

-- 5. Créer les index
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");
CREATE INDEX IF NOT EXISTS "admins_email_idx" ON "admins"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "doctors_email_key" ON "doctors"("email");
CREATE INDEX IF NOT EXISTS "doctors_email_idx" ON "doctors"("email");
CREATE INDEX IF NOT EXISTS "doctors_specialty_idx" ON "doctors"("specialty");

CREATE UNIQUE INDEX IF NOT EXISTS "nurses_email_key" ON "nurses"("email");
CREATE INDEX IF NOT EXISTS "nurses_email_idx" ON "nurses"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "receptionists_email_key" ON "receptionists"("email");
CREATE INDEX IF NOT EXISTS "receptionists_email_idx" ON "receptionists"("email");

CREATE INDEX IF NOT EXISTS "appointments_patient_id_idx" ON "appointments"("patient_id");
CREATE INDEX IF NOT EXISTS "appointments_doctor_id_idx" ON "appointments"("doctor_id");
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointments"("date");

CREATE INDEX IF NOT EXISTS "medical_records_patient_id_idx" ON "medical_records"("patient_id");
CREATE INDEX IF NOT EXISTS "medical_records_doctor_id_idx" ON "medical_records"("doctor_id");

CREATE INDEX IF NOT EXISTS "prescriptions_medical_record_id_idx" ON "prescriptions"("medical_record_id");
CREATE INDEX IF NOT EXISTS "examinations_medical_record_id_idx" ON "examinations"("medical_record_id");
CREATE INDEX IF NOT EXISTS "invoices_patient_id_idx" ON "invoices"("patient_id");

CREATE INDEX IF NOT EXISTS "doctor_nurse_doctor_id_idx" ON "doctor_nurse"("doctor_id");
CREATE INDEX IF NOT EXISTS "doctor_nurse_nurse_id_idx" ON "doctor_nurse"("nurse_id");
CREATE INDEX IF NOT EXISTS "patient_nurse_patient_id_idx" ON "patient_nurse"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_nurse_nurse_id_idx" ON "patient_nurse"("nurse_id");
CREATE INDEX IF NOT EXISTS "patient_receptionist_patient_id_idx" ON "patient_receptionist"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_receptionist_receptionist_id_idx" ON "patient_receptionist"("receptionist_id");

-- 6. Créer les contraintes de clés étrangères
-- Supprimer les anciennes contraintes si elles existent
ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "patients_doctor_id_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctor_id_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_patient_id_fkey";
ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "medical_records_doctor_id_fkey";
ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "medical_records_patient_id_fkey";
ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "medical_records_appointment_id_fkey";
ALTER TABLE "prescriptions" DROP CONSTRAINT IF EXISTS "prescriptions_medical_record_id_fkey";
ALTER TABLE "examinations" DROP CONSTRAINT IF EXISTS "examinations_medical_record_id_fkey";
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_patient_id_fkey";
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_appointment_id_fkey";
ALTER TABLE "doctor_nurse" DROP CONSTRAINT IF EXISTS "doctor_nurse_doctor_id_fkey";
ALTER TABLE "doctor_nurse" DROP CONSTRAINT IF EXISTS "doctor_nurse_nurse_id_fkey";
ALTER TABLE "patient_nurse" DROP CONSTRAINT IF EXISTS "patient_nurse_patient_id_fkey";
ALTER TABLE "patient_nurse" DROP CONSTRAINT IF EXISTS "patient_nurse_nurse_id_fkey";
ALTER TABLE "patient_receptionist" DROP CONSTRAINT IF EXISTS "patient_receptionist_patient_id_fkey";
ALTER TABLE "patient_receptionist" DROP CONSTRAINT IF EXISTS "patient_receptionist_receptionist_id_fkey";

-- Ajouter les nouvelles contraintes
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" 
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" 
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" 
    FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" 
    FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "examinations" ADD CONSTRAINT "examinations_medical_record_id_fkey" 
    FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" 
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" 
    FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "doctor_nurse" ADD CONSTRAINT "doctor_nurse_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "doctor_nurse" ADD CONSTRAINT "doctor_nurse_nurse_id_fkey" 
    FOREIGN KEY ("nurse_id") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_nurse" ADD CONSTRAINT "patient_nurse_patient_id_fkey" 
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_nurse" ADD CONSTRAINT "patient_nurse_nurse_id_fkey" 
    FOREIGN KEY ("nurse_id") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_receptionist" ADD CONSTRAINT "patient_receptionist_patient_id_fkey" 
    FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_receptionist" ADD CONSTRAINT "patient_receptionist_receptionist_id_fkey" 
    FOREIGN KEY ("receptionist_id") REFERENCES "receptionists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. Migrer les données de la table users vers les nouvelles tables (si la table users existe)
-- Décommenter et adapter si vous avez des données à migrer
/*
-- Migrer les admins
INSERT INTO "admins" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM "users" 
WHERE role = 'admin'
ON CONFLICT (id) DO NOTHING;

-- Migrer les médecins
INSERT INTO "doctors" (id, email, password, first_name, last_name, phone, specialty, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, specialty, created_at, updated_at 
FROM "users" 
WHERE role = 'medecin'
ON CONFLICT (id) DO NOTHING;

-- Migrer les infirmiers
INSERT INTO "nurses" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM "users" 
WHERE role = 'infirmier'
ON CONFLICT (id) DO NOTHING;

-- Migrer les réceptionnistes
INSERT INTO "receptionists" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM "users" 
WHERE role = 'receptionniste'
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après l'exécution, vous devriez voir les tables suivantes dans Supabase:
-- - admins
-- - doctors
-- - nurses
-- - receptionists
-- - patients
-- - appointments
-- - medical_records
-- - prescriptions
-- - examinations
-- - invoices
-- - doctor_nurse
-- - patient_nurse
-- - patient_receptionist














