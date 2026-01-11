@echo off
chcp 65001 >nul
title 🌱 Insertion des Utilisateurs de Test

echo.
echo ========================================
echo   🌱 Insertion des Utilisateurs de Test
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
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur lors de la génération du client Prisma
    pause
    exit /b 1
)
echo.

echo Insertion des utilisateurs de test dans la base de données...
echo.
call npm run db:seed
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erreur lors de l'insertion des utilisateurs
    echo.
    echo Vérifiez:
    echo - Que la base de données est accessible
    echo - Que DATABASE_URL est correct dans .env.local
    echo - Que les tables existent (admins, doctors, nurses, receptionists)
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ Utilisateurs insérés avec succès !
echo ========================================
echo.
echo   Comptes de test créés:
echo.
echo   👤 Administrateur:
echo      Email: admin@clinique.com
echo      Mot de passe: admin123
echo.
echo   👨‍⚕️ Médecin:
echo      Email: medecin@clinique.com
echo      Mot de passe: medecin123
echo.
echo   👩‍💼 Réceptionniste:
echo      Email: reception@clinique.com
echo      Mot de passe: reception123
echo.
echo   👩‍⚕️ Infirmier:
echo      Email: infirmier@clinique.com
echo      Mot de passe: infirmier123
echo.
echo ========================================
echo.
pause













