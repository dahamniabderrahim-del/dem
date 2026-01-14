-- =====================================================
-- Script SQL pour créer les tables de jonction Many-to-Many
-- Exécutez ce script dans Supabase SQL Editor
-- =====================================================

-- 1. Table de jonction Doctor ↔ Nurse (Many-to-Many)
CREATE TABLE IF NOT EXISTS "doctor_nurse" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "doctor_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "doctor_nurse_doctor_id_fkey" FOREIGN KEY ("doctor_id") 
        REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "doctor_nurse_nurse_id_fkey" FOREIGN KEY ("nurse_id") 
        REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE("doctor_id", "nurse_id")
);

CREATE INDEX IF NOT EXISTS "doctor_nurse_doctor_id_idx" ON "doctor_nurse"("doctor_id");
CREATE INDEX IF NOT EXISTS "doctor_nurse_nurse_id_idx" ON "doctor_nurse"("nurse_id");

-- 2. Table de jonction Patient ↔ Nurse (Many-to-Many)
CREATE TABLE IF NOT EXISTS "patient_nurse" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "patient_id" TEXT NOT NULL,
    "nurse_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "patient_nurse_patient_id_fkey" FOREIGN KEY ("patient_id") 
        REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patient_nurse_nurse_id_fkey" FOREIGN KEY ("nurse_id") 
        REFERENCES "nurses"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE("patient_id", "nurse_id")
);

CREATE INDEX IF NOT EXISTS "patient_nurse_patient_id_idx" ON "patient_nurse"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_nurse_nurse_id_idx" ON "patient_nurse"("nurse_id");

-- 3. Table de jonction Patient ↔ Receptionist (Many-to-Many)
CREATE TABLE IF NOT EXISTS "patient_receptionist" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "patient_id" TEXT NOT NULL,
    "receptionist_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "patient_receptionist_patient_id_fkey" FOREIGN KEY ("patient_id") 
        REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patient_receptionist_receptionist_id_fkey" FOREIGN KEY ("receptionist_id") 
        REFERENCES "receptionists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE("patient_id", "receptionist_id")
);

CREATE INDEX IF NOT EXISTS "patient_receptionist_patient_id_idx" ON "patient_receptionist"("patient_id");
CREATE INDEX IF NOT EXISTS "patient_receptionist_receptionist_id_idx" ON "patient_receptionist"("receptionist_id");

-- 4. Supprimer la colonne doctor_id de la table patients (si elle existe)
-- Car maintenant la relation Doctor ↔ Patient est Many-to-Many via appointments
ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "patients_doctor_id_fkey";
ALTER TABLE "patients" DROP COLUMN IF EXISTS "doctor_id";

-- 5. Vérifier que la table appointments existe et pointe vers doctors
-- (Elle sert de table de jonction Many-to-Many entre Doctor et Patient)
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_doctor_id_fkey";
ALTER TABLE "appointments" 
ADD CONSTRAINT "appointments_doctor_id_fkey" 
FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_patient_id_fkey";
ALTER TABLE "appointments" 
ADD CONSTRAINT "appointments_patient_id_fkey" 
FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- Vérification : Afficher les tables créées
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('doctor_nurse', 'patient_nurse', 'patient_receptionist', 'appointments')
ORDER BY table_name;

-- =====================================================
-- Exemples de requêtes pour tester les relations
-- =====================================================

-- Exemple 1: Trouver tous les infirmiers d'un médecin
-- SELECT n.* 
-- FROM nurses n
-- INNER JOIN doctor_nurse dn ON n.id = dn.nurse_id
-- WHERE dn.doctor_id = 'ID_DU_MEDECIN';

-- Exemple 2: Trouver tous les médecins d'un infirmier
-- SELECT d.* 
-- FROM doctors d
-- INNER JOIN doctor_nurse dn ON d.id = dn.doctor_id
-- WHERE dn.nurse_id = 'ID_DE_L_INFIRMIER';

-- Exemple 3: Trouver tous les patients d'un infirmier
-- SELECT p.* 
-- FROM patients p
-- INNER JOIN patient_nurse pn ON p.id = pn.patient_id
-- WHERE pn.nurse_id = 'ID_DE_L_INFIRMIER';

-- Exemple 4: Trouver tous les patients d'un réceptionniste
-- SELECT p.* 
-- FROM patients p
-- INNER JOIN patient_receptionist pr ON p.id = pr.patient_id
-- WHERE pr.receptionist_id = 'ID_DU_RECEPTIONNISTE';

-- Exemple 5: Trouver tous les rendez-vous (relation Doctor ↔ Patient)
-- SELECT a.*, d.first_name as doctor_first_name, p.first_name as patient_first_name
-- FROM appointments a
-- INNER JOIN doctors d ON a.doctor_id = d.id
-- INNER JOIN patients p ON a.patient_id = p.id;


























