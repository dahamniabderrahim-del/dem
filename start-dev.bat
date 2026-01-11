@echo off
chcp 65001 >nul
title 🏥 Clinique KARA - Serveur de Développement

echo.
echo ========================================
echo   🏥 Clinique KARA - Mode Développement
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

echo Démarrage du serveur Next.js...
echo.
echo 📍 Application: http://localhost:3000
echo 📍 API: http://localhost:3000/api
echo.
echo ⏹️  Ctrl+C pour arrêter
echo.

call npm run dev

pause













