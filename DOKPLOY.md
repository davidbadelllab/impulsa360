# Guía de Despliegue en Dokploy - Impulsa360

## 🚀 Configuración Rápida

### 1. Variables de Entorno Requeridas

En Dokploy, configura estas variables de entorno:

```env
NODE_ENV=production
PORT=3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ztyijfstkfzltyhhrnyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# JWT Configuration
JWT_SECRET=tu_jwt_secret_super_seguro
SUPABASE_JWT_SECRET=tu_jwt_secret_super_seguro
```

### 2. Configuración de la Aplicación

- **Tipo de Build**: Node.js
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Puerto**: 3000
- **Health Check**: `/api/users`

### 3. Configuración Automática

El proyecto incluye un archivo `dokploy.json` con la configuración óptima.

## 📋 Pasos de Despliegue

### Opción A: Desde GitHub/GitLab

1. **Conecta tu repositorio** en Dokploy
2. **Configura las variables de entorno** (arriba)
3. **Deploy automático** se ejecutará

### Opción B: Upload Manual

1. **Comprimir proyecto**:
   ```bash
   tar -czf impulsa360.tar.gz --exclude=node_modules --exclude=.git --exclude=dist .
   ```

2. **Subir a Dokploy** usando el upload manual

3. **Configurar variables de entorno**

4. **Deploy**

## ⚙️ Post-Despliegue

### Crear Usuarios de Prueba

Después del primer despliegue, ejecutar en la consola de Dokploy:

```bash
npm run seed:users
```

Esto creará los usuarios de prueba:
- `admin@impulsa360.com` / `password` (Super Admin)
- `test@example.com` / `password` (Admin)
- `demo@impulsa360.com` / `demo123` (Usuario)

## 🔧 Configuración Avanzada

### Recursos Recomendados

- **Memory**: 512Mi mínimo, 1Gi recomendado
- **CPU**: 500m mínimo, 1000m recomendado

### Custom Domain

1. Configura tu dominio en Dokploy
2. La aplicación automáticamente detectará el nuevo hostname

### SSL

Dokploy maneja SSL automáticamente con Let's Encrypt.

## 🔍 Troubleshooting

### Error: "API endpoint not found"

- Verifica que las variables de entorno estén configuradas
- Confirma que el puerto 3000 esté expuesto

### Error: "Supabase connection failed"

- Revisa `NEXT_PUBLIC_SUPABASE_URL`
- Verifica `SUPABASE_SERVICE_ROLE_KEY`

### Error: "JWT token invalid"

- Asegúrate de que `JWT_SECRET` coincida en todas las instancias

### Build Fails

- Verifica que todas las dependencias estén en `dependencies` (no `devDependencies`)
- Node.js 18+ es requerido

## 📊 Monitoreo

### Logs

```bash
# Ver logs de la aplicación
docker logs <container_name>

# Seguir logs en tiempo real
docker logs -f <container_name>
```

### Health Check

El endpoint `/api/users` está configurado como health check.

### Métricas

- CPU y memoria son monitoreados automáticamente por Dokploy
- Logs de acceso disponibles en el dashboard

## 🔄 Actualizaciones

### Deploy Automático

Si conectaste con Git, cada push a la rama principal triggerea un nuevo deploy.

### Deploy Manual

1. Upload nueva versión
2. Dokploy construirá automáticamente
3. Zero-downtime deployment

## 📚 Archivos de Configuración

- `dokploy.json` - Configuración principal
- `.dokployignore` - Archivos excluidos del build
- `package.json` - Scripts de build y start

## 🆘 Soporte

Si encuentras problemas:

1. Revisa logs en Dokploy dashboard
2. Verifica variables de entorno
3. Confirma conectividad con Supabase
4. Checa que el puerto 3000 esté abierto

## 🔐 Seguridad

- Variables de entorno están encriptadas en Dokploy
- JWT tokens son seguros con secretos fuertes
- Supabase maneja autenticación y autorización
- CORS está configurado apropiadamente
