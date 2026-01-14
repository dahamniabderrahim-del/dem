-- CreateEnum
CREATE TYPE IF NOT EXISTS "Gender" AS ENUM ('M', 'F', 'Autre');

-- CreateEnum
CREATE TYPE IF NOT EXISTS "AppointmentStatus" AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- CreateEnum
CREATE TYPE IF NOT EXISTS "ExaminationStatus" AS ENUM ('requested', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE IF NOT EXISTS "InvoiceStatus" AS ENUM ('pending', 'paid', 'cancelled');

-- DropForeignKey (si elles existent)
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

-- DropTable (supprimer l'ancienne table users si elle existe)
DROP TABLE IF EXISTS "users" CASCADE;

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

-- CreateTable
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "medical_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "diagnosis" TEXT,
    "symptoms" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE IF NOT EXISTS "doctor_nurse" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_nurse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "patient_nurse" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_nurse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "patient_receptionist" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "receptionist_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_receptionist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctors_email_idx" ON "doctors"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctors_specialty_idx" ON "doctors"("specialty");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "nurses_email_key" ON "nurses"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "nurses_email_idx" ON "nurses"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "receptionists_email_key" ON "receptionists"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "receptionists_email_idx" ON "receptionists"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_doctor_id_idx" ON "appointments"("doctor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointments"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "medical_records_doctor_id_idx" ON "medical_records"("doctor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "prescriptions_medical_record_id_idx" ON "prescriptions"("medical_record_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "examinations_medical_record_id_idx" ON "examinations"("medical_record_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "invoices_patient_id_idx" ON "invoices"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "doctor_nurse_doctor_id_nurse_id_key" ON "doctor_nurse"("doctor_id", "nurse_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_nurse_doctor_id_idx" ON "doctor_nurse"("doctor_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "doctor_nurse_nurse_id_idx" ON "doctor_nurse"("nurse_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "patient_nurse_patient_id_nurse_id_key" ON "patient_nurse"("patient_id", "nurse_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "patient_nurse_patient_id_idx" ON "patient_nurse"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "patient_nurse_nurse_id_idx" ON "patient_nurse"("nurse_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "patient_receptionist_patient_id_receptionist_id_key" ON "patient_receptionist"("patient_id", "receptionist_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "patient_receptionist_patient_id_idx" ON "patient_receptionist"("patient_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "patient_receptionist_receptionist_id_idx" ON "patient_receptionist"("receptionist_id");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_nurse" ADD CONSTRAINT "doctor_nurse_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_nurse" ADD CONSTRAINT "doctor_nurse_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nurse" ADD CONSTRAINT "patient_nurse_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_nurse" ADD CONSTRAINT "patient_nurse_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_receptionist" ADD CONSTRAINT "patient_receptionist_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_receptionist" ADD CONSTRAINT "patient_receptionist_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") REFERENCES "receptionists"("id") ON DELETE CASCADE ON UPDATE CASCADE;















