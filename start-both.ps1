# Script para iniciar tanto el servidor backend como el frontend
Write-Host "Iniciando servidor backend y frontend..." -ForegroundColor Green

# Iniciar el servidor backend en segundo plano
Write-Host "Iniciando servidor backend (puerto 3000)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "server.js"

# Esperar un momento para que el backend inicie
Start-Sleep -Seconds 3

# Iniciar el servidor frontend en segundo plano
Write-Host "Iniciando servidor frontend (puerto 5173/5174)..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"

Write-Host "Ambos servidores iniciados!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 o http://localhost:5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para detener ambos servidores, presiona Ctrl+C o ejecuta: Get-Process -Name 'node' | Stop-Process -Force" -ForegroundColor Red 