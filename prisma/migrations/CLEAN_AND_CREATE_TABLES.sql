-- ============================================
-- Script de nettoyage et création des tables
-- À exécuter dans Supabase SQL Editor AVANT les migrations Prisma
-- ============================================

-- 1. Supprimer les contraintes de clés étrangères problématiques
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

-- 2. Nettoyer les données invalides dans patients
UPDATE "patients" 
SET "doctor_id" = NULL 
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "patients"."doctor_id");

-- 3. Nettoyer les données invalides dans appointments
-- Mettre à NULL les doctor_id invalides
UPDATE "appointments" 
SET "doctor_id" = NULL
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "appointments"."doctor_id");

-- Supprimer les appointments avec patient_id invalide
DELETE FROM "appointments" 
WHERE "patient_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "patients" WHERE "patients"."id" = "appointments"."patient_id");

-- 4. Nettoyer les données invalides dans medical_records
UPDATE "medical_records" 
SET "doctor_id" = NULL
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "medical_records"."doctor_id");

DELETE FROM "medical_records" 
WHERE "patient_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "patients" WHERE "patients"."id" = "medical_records"."patient_id");

-- 5. Nettoyer les données invalides dans invoices
DELETE FROM "invoices" 
WHERE "patient_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "patients" WHERE "patients"."id" = "invoices"."patient_id");

-- 6. Nettoyer les tables de jonction
DELETE FROM "doctor_nurse" 
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "doctor_nurse"."doctor_id");

DELETE FROM "doctor_nurse" 
WHERE "nurse_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "nurses" WHERE "nurses"."id" = "doctor_nurse"."nurse_id");

DELETE FROM "patient_nurse" 
WHERE "patient_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "patients" WHERE "patients"."id" = "patient_nurse"."patient_id");

DELETE FROM "patient_nurse" 
WHERE "nurse_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "nurses" WHERE "nurses"."id" = "patient_nurse"."nurse_id");

DELETE FROM "patient_receptionist" 
WHERE "patient_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "patients" WHERE "patients"."id" = "patient_receptionist"."patient_id");

DELETE FROM "patient_receptionist" 
WHERE "receptionist_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "receptionists" WHERE "receptionists"."id" = "patient_receptionist"."receptionist_id");

-- 7. Modifier la colonne doctor_id dans appointments pour permettre NULL temporairement
ALTER TABLE "appointments" ALTER COLUMN "doctor_id" DROP NOT NULL;

-- 8. Modifier la colonne doctor_id dans medical_records pour permettre NULL temporairement
ALTER TABLE "medical_records" ALTER COLUMN "doctor_id" DROP NOT NULL;

-- ============================================
-- Après avoir exécuté ce script, exécutez:
-- npx prisma db push
-- ============================================















