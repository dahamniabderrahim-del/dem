-- CreateTable
CREATE TABLE IF NOT EXISTS "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "doctors" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "specialty" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "nurses" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "receptionists" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receptionists_pkey" PRIMARY KEY ("id")
);

-- Migrer les données de users vers les nouvelles tables (si users existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
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
    END IF;
END $$;

-- Supprimer les anciennes contraintes
ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "patients_doctor_id_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctor_id_fkey";
ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "medical_records_doctor_id_fkey";

-- Nettoyer les doctor_id invalides dans patients (mettre à NULL si le doctor n'existe pas)
UPDATE "patients" 
SET "doctor_id" = NULL 
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "patients"."doctor_id");

-- Nettoyer les doctor_id invalides dans appointments
UPDATE "appointments" 
SET "doctor_id" = (SELECT id FROM "doctors" LIMIT 1)
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "appointments"."doctor_id")
  AND EXISTS (SELECT 1 FROM "doctors" LIMIT 1);

-- Si aucun doctor n'existe, supprimer les appointments orphelins
DELETE FROM "appointments" 
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "appointments"."doctor_id");

-- Nettoyer les doctor_id invalides dans medical_records
UPDATE "medical_records" 
SET "doctor_id" = (SELECT id FROM "doctors" LIMIT 1)
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "medical_records"."doctor_id")
  AND EXISTS (SELECT 1 FROM "doctors" LIMIT 1);

-- Si aucun doctor n'existe, supprimer les medical_records orphelins
DELETE FROM "medical_records" 
WHERE "doctor_id" IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM "doctors" WHERE "doctors"."id" = "medical_records"."doctor_id");

-- Recréer les contraintes
ALTER TABLE "patients" ADD CONSTRAINT "patients_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" 
    FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");
CREATE INDEX IF NOT EXISTS "admins_email_idx" ON "admins"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_email_key" ON "doctors"("email");
CREATE INDEX IF NOT EXISTS "doctors_email_idx" ON "doctors"("email");
CREATE INDEX IF NOT EXISTS "doctors_specialty_idx" ON "doctors"("specialty");
CREATE UNIQUE INDEX IF NOT EXISTS "nurses_email_key" ON "nurses"("email");
CREATE INDEX IF NOT EXISTS "nurses_email_idx" ON "nurses"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "receptionists_email_key" ON "receptionists"("email");
CREATE INDEX IF NOT EXISTS "receptionists_email_idx" ON "receptionists"("email");
