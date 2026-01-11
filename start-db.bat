@echo off
chcp 65001 >nul
title 🗄️ Prisma Studio - Clinique KARA

echo.
echo ========================================
echo   🗄️ Prisma Studio - Base de Données
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
echo.

echo Démarrage de Prisma Studio...
echo.
echo 📍 Prisma Studio: http://localhost:5555
echo.
echo ⏹️  Ctrl+C pour arrêter
echo.

call npm run db:studio

pause













