# Usar Node.js 18 LTS
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de npm
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Build de la aplicación (opcional, si usas TypeScript o frontend)
RUN npm run build || true

# Exponer puerto 3000 (Express)
EXPOSE 3000

# Comando para servir el backend en producción
CMD ["node", "server.js"]
