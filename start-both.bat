@echo off
echo 🚀 Iniciando servidor backend y frontend...

echo 📡 Iniciando servidor backend (puerto 3000)...
start "Backend Server" node server.js

echo Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak > nul

echo 🌐 Iniciando servidor frontend (puerto 5173/5174)...
start "Frontend Server" npm run dev

echo ✅ Ambos servidores iniciados!
echo 📡 Backend: http://localhost:3000
echo 🌐 Frontend: http://localhost:5173 o http://localhost:5174
echo.
echo Para detener ambos servidores, cierra las ventanas o ejecuta: taskkill /f /im node.exe
pause 