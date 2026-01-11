@echo off
echo ========================================
echo   Nettoyage du cache Next.js
echo ========================================
echo.

echo [1] Arret des processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo OK
echo.

echo [2] Suppression du dossier .next...
if exist ".next" (
    rmdir /s /q .next
    echo Dossier .next supprime
) else (
    echo Dossier .next n'existe pas
)
echo.

echo [3] Suppression du cache node_modules/.cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Cache node_modules supprime
) else (
    echo Cache node_modules n'existe pas
)
echo.

echo [4] Regeneration du client Prisma...
call npm run db:generate
echo.

echo [5] Redemarrage du serveur...
echo.
echo Pour demarrer le serveur, executez:
echo   npm run dev
echo.
pause













