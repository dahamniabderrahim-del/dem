@echo off
echo ========================================
echo   Redemarrage du serveur Next.js
echo ========================================
echo.

echo [1] Arret des processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo OK
echo.

echo [2] Nettoyage du cache .next...
if exist ".next" (
    rmdir /s /q .next
    echo Cache .next supprime
) else (
    echo Cache .next n'existe pas
)
echo.

echo [3] Nettoyage du cache node_modules...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules supprime
) else (
    echo Cache node_modules n'existe pas
)
echo.

echo [4] Regeneration du client Prisma...
call npm run db:generate
if %errorlevel% neq 0 (
    echo ATTENTION: Erreur lors de la generation Prisma
    echo Essayez de fermer tous les processus et reessayez
)
echo.

echo [5] Demarrage du serveur...
echo.
echo Le serveur va demarrer dans quelques secondes...
echo Ouvrez http://localhost:3000 dans votre navigateur
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm run dev













