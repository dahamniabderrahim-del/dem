@echo off
chcp 65001 >nul
title 🔍 Vérification des Utilisateurs

echo.
echo ========================================
echo   🔍 Vérification des Utilisateurs
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

echo Génération du client Prisma...
call npm run db:generate >nul 2>&1
echo.

echo Vérification des utilisateurs dans la base de données...
echo.

node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { const [admins, doctors, nurses, receptionists] = await Promise.all([prisma.admin.findMany(), prisma.doctor.findMany(), prisma.nurse.findMany(), prisma.receptionist.findMany()]); console.log('📊 Utilisateurs trouvés:'); console.log('   Admins:', admins.length); admins.forEach(u => console.log('     -', u.email)); console.log('   Médecins:', doctors.length); doctors.forEach(u => console.log('     -', u.email)); console.log('   Infirmiers:', nurses.length); nurses.forEach(u => console.log('     -', u.email)); console.log('   Réceptionnistes:', receptionists.length); receptionists.forEach(u => console.log('     -', u.email)); if (admins.length === 0 && doctors.length === 0 && nurses.length === 0 && receptionists.length === 0) { console.log(''); console.log('⚠️  Aucun utilisateur trouvé!'); console.log('   Exécutez seed-users.bat pour créer les utilisateurs de test.'); } } catch (e) { console.error('❌ Erreur:', e.message); } finally { await prisma.$disconnect(); } })();"

echo.
echo ========================================
echo.
pause














