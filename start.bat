@echo off
echo ========================================
echo   Demarrage Clinique Kara
echo ========================================
echo.

REM Vérifier si node_modules existe
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
    echo.
)

REM Générer le client Prisma
echo Generation du client Prisma...
call npm run db:generate
echo.

REM Démarrer le serveur de développement
echo Demarrage du serveur de developpement...
echo Frontend + Backend seront accessibles sur http://localhost:3000
echo.
call npm run dev
