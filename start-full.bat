@echo off
chcp 65001 >nul
title 🏥 Clinique KARA - Tous les Services

echo.
echo ========================================
echo   🏥 Clinique KARA - Tous les Services
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

echo Démarrage de tous les services...
echo.

REM Créer le fichier .env.local si nécessaire
if not exist ".env.local" (
    echo Création du fichier .env.local...
    (
        echo JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
        echo DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
    ) > .env.local
)

REM Générer le client Prisma
echo [1/3] Génération du client Prisma...
call npm run db:generate >nul 2>&1
echo    ✓ Client Prisma généré
echo.

REM Lancer Prisma Studio dans une nouvelle fenêtre
echo [2/3] Démarrage de Prisma Studio...
start "Prisma Studio" cmd /k "npm run db:studio"
timeout /t 2 >nul
echo    ✓ Prisma Studio démarré (http://localhost:5555)
echo.

REM Lancer Next.js
echo [3/3] Démarrage du serveur Next.js...
echo.
echo ========================================
echo   🚀 Services démarrés
echo ========================================
echo.
echo   📍 Application: http://localhost:3000
echo   📍 API: http://localhost:3000/api
echo   📍 Prisma Studio: http://localhost:5555
echo.
echo   ⏹️  Fermez cette fenêtre pour arrêter tous les services
echo.
echo ========================================
echo.

call npm run dev

REM Nettoyage si Ctrl+C
echo.
echo Arrêt de tous les services...
taskkill /FI "WINDOWTITLE eq Prisma Studio*" /F >nul 2>&1
echo ✓ Services arrêtés
pause














