#!/bin/bash

# Script para iniciar tanto el servidor backend como el frontend
echo -e "\033[32mIniciando servidor backend y frontend...\033[0m"

# Función para manejar la terminación del script
cleanup() {
    echo -e "\n\033[31mDeteniendo servidores...\033[0m"
    pkill -f "node server.js"
    pkill -f "vite"
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGINT SIGTERM

# Iniciar el servidor backend en segundo plano
echo -e "\033[33mIniciando servidor backend (puerto 3000)...\033[0m"
node server.js &
BACKEND_PID=$!

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar el servidor frontend en segundo plano
echo -e "\033[33mIniciando servidor frontend (puerto 5173/5174)...\033[0m"
npm run dev &
FRONTEND_PID=$!

echo -e "\033[32mAmbos servidores iniciados!\033[0m"
echo -e "\033[36mBackend: http://localhost:3000\033[0m"
echo -e "\033[36mFrontend: http://localhost:5173 o http://localhost:5174\033[0m"
echo ""
echo -e "\033[31mPara detener ambos servidores, presiona Ctrl+C\033[0m"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID