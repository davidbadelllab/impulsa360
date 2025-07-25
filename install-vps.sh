#!/bin/bash

# Script de instalación para Impulsa360 en VPS Ubuntu
# Ejecutar como root: sudo bash install-vps.sh

set -e

echo "🚀 Instalando Impulsa360 en VPS Ubuntu..."

# Actualizar sistema
echo "📦 Actualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18 LTS
echo "📦 Instalando Node.js 18 LTS..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
echo "✅ Versión de Node.js: $(node --version)"
echo "✅ Versión de npm: $(npm --version)"

# Crear directorio de la aplicación
echo "📁 Creando directorio de aplicación..."
mkdir -p /var/www/impulsa360
cd /var/www/impulsa360

# Copiar archivos (asume que ya están en el directorio actual)
echo "📋 Configurando aplicación..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --production

# Construir aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Configurar permisos
echo "🔒 Configurando permisos..."
chown -R www-data:www-data /var/www/impulsa360
chmod -R 755 /var/www/impulsa360

# Instalar servicio systemd
echo "⚙️ Configurando servicio systemd..."
cp impulsa360.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable impulsa360
systemctl start impulsa360

# Instalar y configurar nginx (opcional)
echo "🌐 ¿Deseas instalar y configurar nginx? (y/n)"
read -r install_nginx

if [ "$install_nginx" = "y" ] || [ "$install_nginx" = "Y" ]; then
    echo "📦 Instalando nginx..."
    apt install -y nginx
    
    # Crear configuración de nginx
    cat > /etc/nginx/sites-available/impulsa360 << 'EOF'
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # Habilitar sitio
    ln -sf /etc/nginx/sites-available/impulsa360 /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl restart nginx
    systemctl enable nginx
fi

# Instalar UFW (firewall)
echo "🔥 Configurando firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

echo "✅ Instalación completada!"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs: sudo journalctl -u impulsa360 -f"
echo "   Reiniciar: sudo systemctl restart impulsa360"
echo "   Estado: sudo systemctl status impulsa360"
echo ""
echo "🌍 La aplicación está ejecutándose en:"
echo "   http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "⚠️  Recuerda:"
echo "   1. Configurar las variables de entorno en /var/www/impulsa360/.env"
echo "   2. Cambiar el dominio en nginx si instalaste nginx"
echo "   3. Configurar SSL con Let's Encrypt si es necesario"
