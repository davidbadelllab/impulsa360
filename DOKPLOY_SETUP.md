# Configuración de Variables de Entorno para Dokploy

## Problema
Tu aplicación está mostrando errores `ERR_CONNECTION_REFUSED` porque está intentando conectarse a `localhost:3000` en lugar de usar la URL correcta del servidor desplegado en Dokploy.

## Solución
La aplicación ahora detectará automáticamente la URL correcta, pero para mayor control, configura estas variables de entorno en tu panel de Dokploy:

### Variables Requeridas

1. **NEXT_PUBLIC_API_BASE_URL**
   - Valor: `https://www.impulsa360.tech/api`
   - Descripción: URL base para las llamadas a la API desde el frontend

2. **API_BASE_URL**
   - Valor: `https://www.impulsa360.tech/api`
   - Descripción: URL base para las llamadas a la API desde el servidor

3. **NODE_ENV**
   - Valor: `production`
   - Descripción: Establece el entorno como producción

4. **PORT**
   - Valor: `3000`
   - Descripción: Puerto en el que correrá la aplicación

### Variables ya existentes (mantener)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- Todas las variables de PostgreSQL/Supabase

## Pasos para configurar en Dokploy

### Opción 1: Detección Automática (Recomendado)
La aplicación ahora detecta automáticamente la URL correcta basada en el dominio desde donde se accede. Solo necesitas redesplegar la aplicación.

### Opción 2: Configuración Manual
Si prefieres especificar manualmente las URLs:

1. Ve a tu aplicación en el panel de Dokploy
2. Navega a la sección "Environment Variables" o "Variables de Entorno"
3. Agrega la variable `NEXT_PUBLIC_API_BASE_URL` con valor `https://www.impulsa360.tech/api`
4. Guarda los cambios
5. Redeploya la aplicación

### Verificación del Fix
Después del deployment, abre las herramientas de desarrollador en tu navegador y revisa la consola. Deberías ver un mensaje como:
```
🔧 API Base URL configurada: https://www.impulsa360.tech/api
```

## Verificación

Después del deployment, tu aplicación debería:
- Cargar correctamente sin errores de conexión
- Hacer llamadas API a la URL correcta
- Mostrar datos del dashboard sin errores

## Si el problema persiste

Si después de estos cambios sigues viendo errores:
1. Verifica que todas las variables estén correctamente configuradas
2. Revisa los logs del deployment en Dokploy
3. Asegúrate de que la URL del dominio sea exactamente la correcta (con https://)
