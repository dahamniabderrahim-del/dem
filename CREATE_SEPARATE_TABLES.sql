-- =====================================================
-- Script SQL pour créer les tables séparées
-- Exécutez ce script directement dans Supabase SQL Editor
-- =====================================================

-- 1. Créer la table admins
CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Créer la table doctors
CREATE TABLE IF NOT EXISTS "doctors" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Créer la table nurses
CREATE TABLE IF NOT EXISTS "nurses" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Créer la table receptionists
CREATE TABLE IF NOT EXISTS "receptionists" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Créer les index
CREATE INDEX IF NOT EXISTS "admins_email_idx" ON "admins"("email");
CREATE INDEX IF NOT EXISTS "doctors_email_idx" ON "doctors"("email");
CREATE INDEX IF NOT EXISTS "doctors_specialty_idx" ON "doctors"("specialty");
CREATE INDEX IF NOT EXISTS "nurses_email_idx" ON "nurses"("email");
CREATE INDEX IF NOT EXISTS "receptionists_email_idx" ON "receptionists"("email");

-- 6. Migrer les données existantes de users vers les nouvelles tables
-- (Décommentez cette section si vous avez des données dans la table users)

/*
INSERT INTO "admins" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM users 
WHERE role = 'admin'
ON CONFLICT (email) DO NOTHING;

INSERT INTO "doctors" (id, email, password, first_name, last_name, phone, specialty, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, specialty, created_at, updated_at 
FROM users 
WHERE role = 'medecin'
ON CONFLICT (email) DO NOTHING;

INSERT INTO "nurses" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM users 
WHERE role = 'infirmier'
ON CONFLICT (email) DO NOTHING;

INSERT INTO "receptionists" (id, email, password, first_name, last_name, phone, created_at, updated_at)
SELECT id, email, password, first_name, last_name, phone, created_at, updated_at 
FROM users 
WHERE role = 'receptionniste'
ON CONFLICT (email) DO NOTHING;
*/

-- 7. Mettre à jour les clés étrangères pour pointer vers doctors
-- Supprimer les anciennes contraintes (si elles existent)
ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "patients_doctor_id_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctor_id_fkey";
ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "medical_records_doctor_id_fkey";

-- Ajouter les nouvelles contraintes pointant vers doctors
ALTER TABLE "patients" 
ADD CONSTRAINT "patients_doctor_id_fkey" 
FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointments" 
ADD CONSTRAINT "appointments_doctor_id_fkey" 
FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_records" 
ADD CONSTRAINT "medical_records_doctor_id_fkey" 
FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. (OPTIONNEL) Supprimer l'ancienne table users après vérification
-- ATTENTION : Ne faites cela QUE si vous êtes sûr que toutes les données ont été migrées
-- DROP TABLE IF EXISTS "users" CASCADE;

-- =====================================================
-- Vérification : Afficher les tables créées
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admins', 'doctors', 'nurses', 'receptionists')
ORDER BY table_name;

























