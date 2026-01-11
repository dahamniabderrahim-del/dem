@echo off
echo ========================================
echo   Diagnostic du Site
echo ========================================
echo.

echo [1] Verification de Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe!
    pause
    exit /b 1
)
echo OK
echo.

echo [2] Verification de npm...
npm --version
if %errorlevel% neq 0 (
    echo ERREUR: npm n'est pas installe!
    pause
    exit /b 1
)
echo OK
echo.

echo [3] Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances...
    call npm install
) else (
    echo Dependances deja installees
)
echo.

echo [4] Verification du fichier .env.local...
if not exist ".env.local" (
    echo ATTENTION: .env.local n'existe pas!
    echo Creation du fichier .env.local...
    (
        echo JWT_SECRET=your-secret-key-change-in-production
        echo NEXT_PUBLIC_API_URL=http://localhost:3000/api
        echo DATABASE_URL=your-database-url
    ) > .env.local
    echo Fichier .env.local cree. Veuillez le configurer.
) else (
    echo Fichier .env.local existe
)
echo.

echo [5] Verification du client Prisma...
if not exist "node_modules\.prisma\client" (
    echo Generation du client Prisma...
    call npm run db:generate
) else (
    echo Client Prisma existe
)
echo.

echo [6] Compilation du projet...
call npm run build
if %errorlevel% neq 0 (
    echo ERREUR: La compilation a echoue!
    echo Verifiez les erreurs ci-dessus.
    pause
    exit /b 1
)
echo OK
echo.

echo ========================================
echo   Diagnostic termine
echo ========================================
echo.
echo Pour demarrer le serveur:
echo   npm run dev
echo.
pause













