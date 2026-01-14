@echo off
echo Arrêt de tous les processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Régénération du client Prisma...
call npm run db:generate

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Client Prisma régénéré avec succès!
    echo.
    echo Vous pouvez maintenant redémarrer le serveur avec: npm run dev
) else (
    echo.
    echo ❌ Erreur lors de la régénération du client Prisma
    echo Veuillez vérifier les erreurs ci-dessus
)

pause













