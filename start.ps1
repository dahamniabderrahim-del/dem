Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🏥 Système de Gestion de Clinique" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "Création du fichier .env.local..." -ForegroundColor Yellow
    @"
JWT_SECRET=votre-secret-jwt-tres-securise
NEXT_PUBLIC_API_URL=http://localhost:3000/api
"@ | Out-File -FilePath ".env.local" -Encoding utf8
    Write-Host "✓ Fichier .env.local créé" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Le site sera disponible sur: http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Pour arrêter le serveur, appuyez sur Ctrl+C" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev


























