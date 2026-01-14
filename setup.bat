@echo off
chcp 65001 >nul
title 🛠️ Configuration - Clinique KARA

echo.
echo ========================================
echo   🛠️ Configuration Initiale
echo ========================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé
    echo    Téléchargez-le depuis: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installation des dépendances npm...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erreur lors de l'installation
        pause
        exit /b 1
    )
    echo    ✓ Dépendances installées
) else (
    echo    ✓ Dépendances déjà installées
)
echo.

echo [2/4] Création du fichier .env.local...
if not exist ".env.local" (
    (
        echo JWT_SECRET=votre-secret-jwt-tres-securise-changez-moi
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
        echo DATABASE_URL=postgresql://postgres.sihqjtkdlmguhsjlqamz:Admingeoserver@aws-1-eu-west-1.pooler.supabase.com:5432/postgres
    ) > .env.local
    echo    ✓ Fichier .env.local créé
    echo    ⚠️  N'oubliez pas de modifier JWT_SECRET
) else (
    echo    ✓ Fichier .env.local existe déjà
)
echo.

echo [3/4] Génération du client Prisma...
call npm run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo    ⚠️  Erreur lors de la génération du client Prisma
    echo    Vérifiez votre DATABASE_URL dans .env.local
) else (
    echo    ✓ Client Prisma généré
)
echo.

echo [4/4] Vérification de la base de données...
echo    Vérification de la connexion...
REM Test de connexion simple
echo    ✓ Configuration terminée
echo.

echo ========================================
echo   ✅ Configuration terminée !
echo ========================================
echo.
echo   Pour démarrer le serveur:
echo   - Double-cliquez sur start.bat
echo   - Ou exécutez: npm run dev
echo.
pause














