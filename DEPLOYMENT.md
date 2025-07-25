# Guía de Despliegue - Impulsa360

Esta guía te ayudará a desplegar Impulsa360 en un VPS con Ubuntu.

## 🏗️ Arquitectura del Proyecto

- **Backend**: Node.js + Express (puerto 3000)
- **Frontend**: React + Vite (se construye y sirve estáticamente)
- **Base de datos**: Supabase
- **Servidor web**: Nginx (opcional, como proxy reverso)

## 📋 Requisitos del VPS

- Ubuntu 18.04 LTS o superior
- Al menos 1GB de RAM
- Node.js 18 LTS
- Acceso root o sudo

## 🚀 Instalación Automática

1. **Subir archivos al VPS**:
   ```bash
   # Comprimir proyecto localmente
   tar -czf impulsa360.tar.gz .
   
   # Subir al VPS (reemplaza con tu IP)
   scp impulsa360.tar.gz root@tu-ip-vps:/tmp/
   ```

2. **Conectar al VPS y extraer**:
   ```bash
   ssh root@tu-ip-vps
   cd /tmp
   tar -xzf impulsa360.tar.gz
   ```

3. **Ejecutar script de instalación**:
   ```bash
   sudo bash install-vps.sh
   ```

## 🔧 Instalación Manual

### 1. Preparar el sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 2. Configurar la aplicación

```bash
# Crear directorio
sudo mkdir -p /var/www/impulsa360
cd /var/www/impulsa360

# Copiar archivos del proyecto
# (subir via scp, rsync, git clone, etc.)

# Instalar dependencias
npm install --production

# Construir aplicación
npm run build

# Configurar permisos
sudo chown -R www-data:www-data /var/www/impulsa360
sudo chmod -R 755 /var/www/impulsa360
```

### 3. Configurar variables de entorno

```bash
# Crear archivo .env
sudo nano /var/www/impulsa360/.env
```

Contenido del archivo `.env`:
```env
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://ztyijfstkfzltyhhrnyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_key
JWT_SECRET=tu_jwt_secret_super_seguro
SUPABASE_JWT_SECRET=tu_jwt_secret_super_seguro
```

### 4. Configurar servicio systemd

```bash
# Copiar archivo de servicio
sudo cp impulsa360.service /etc/systemd/system/

# Recargar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar servicio
sudo systemctl enable impulsa360
sudo systemctl start impulsa360

# Verificar estado
sudo systemctl status impulsa360
```

### 5. Configurar Nginx (Opcional)

```bash
# Instalar nginx
sudo apt install -y nginx

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/impulsa360
```

Contenido de la configuración de nginx:
```nginx
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
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/impulsa360 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Configurar firewall

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH, HTTP y HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Ver estado
sudo ufw status
```

## 📱 Scripts Disponibles

```bash
# Desarrollo (frontend y backend simultáneamente)
npm run start:dev

# Producción (construir y servir)
npm start

# Solo construir frontend
npm run build

# Solo servidor backend
npm run server
```

## 🔍 Comandos Útiles

```bash
# Ver logs del servicio
sudo journalctl -u impulsa360 -f

# Reiniciar servicio
sudo systemctl restart impulsa360

# Ver estado del servicio
sudo systemctl status impulsa360

# Parar servicio
sudo systemctl stop impulsa360

# Ver logs de nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔒 SSL con Let's Encrypt (Opcional)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐛 Solución de Problemas

### Servicio no inicia
```bash
# Ver logs detallados
sudo journalctl -u impulsa360 -n 50

# Verificar archivo de servicio
sudo systemctl status impulsa360
```

### Error de permisos
```bash
# Corregir permisos
sudo chown -R www-data:www-data /var/www/impulsa360
sudo chmod -R 755 /var/www/impulsa360
```

### Puerto ocupado
```bash
# Ver qué proceso usa el puerto 3000
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID
```

### Problemas con la base de datos
- Verificar variables de entorno en `.env`
- Comprobar conectividad con Supabase
- Revisar logs de la aplicación

## 📊 Monitoreo

Para monitorear tu aplicación puedes usar:
- `htop` para recursos del sistema
- `sudo journalctl -u impulsa360 -f` para logs en tiempo real
- Nginx access logs para tráfico web

## 🔄 Actualización

Para actualizar la aplicación:

```bash
# Parar servicio
sudo systemctl stop impulsa360

# Navegar al directorio
cd /var/www/impulsa360

# Actualizar código (git pull, scp, etc.)
# git pull origin main

# Instalar nuevas dependencias
npm install --production

# Construir nueva versión
npm run build

# Iniciar servicio
sudo systemctl start impulsa360
```

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs del servicio
2. Verifica la configuración de nginx
3. Comprueba las variables de entorno
4. Asegúrate de que todos los puertos estén abiertos
