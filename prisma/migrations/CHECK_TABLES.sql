-- ============================================
-- Script pour vérifier l'état des tables
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Vérifier quelles tables existent
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- Vérifier les tables utilisateurs
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') 
        THEN '✅ admins existe'
        ELSE '❌ admins n''existe pas'
    END as admins_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') 
        THEN '✅ doctors existe'
        ELSE '❌ doctors n''existe pas'
    END as doctors_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nurses') 
        THEN '✅ nurses existe'
        ELSE '❌ nurses n''existe pas'
    END as nurses_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'receptionists') 
        THEN '✅ receptionists existe'
        ELSE '❌ receptionists n''existe pas'
    END as receptionists_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN '⚠️ users existe (ancienne table)'
        ELSE '✅ users n''existe pas (bon)'
    END as users_status;

-- Compter les enregistrements dans chaque table utilisateur (si elles existent)
SELECT 
    'admins' as table_name,
    COUNT(*) as count
FROM admins
UNION ALL
SELECT 
    'doctors' as table_name,
    COUNT(*) as count
FROM doctors
UNION ALL
SELECT 
    'nurses' as table_name,
    COUNT(*) as count
FROM nurses
UNION ALL
SELECT 
    'receptionists' as table_name,
    COUNT(*) as count
FROM receptionists
UNION ALL
SELECT 
    'patients' as table_name,
    COUNT(*) as count
FROM patients
UNION ALL
SELECT 
    'appointments' as table_name,
    COUNT(*) as count
FROM appointments;

-- Vérifier les contraintes de clés étrangères
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND (tc.table_name LIKE '%appointment%' 
         OR tc.table_name LIKE '%medical_record%'
         OR tc.table_name LIKE '%doctor%'
         OR tc.table_name LIKE '%nurse%')
ORDER BY
    tc.table_name, kcu.column_name;














