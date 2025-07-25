// Script para verificar las variables de entorno en Dokploy
// Ejecuta esto en la consola de tu navegador para verificar la configuración

console.log('🔍 Verificando configuración de API...');

// Verificar si las variables están definidas
const apiBaseUrl = window.location.origin + '/api';
console.log('✅ URL base detectada automáticamente:', apiBaseUrl);

// Verificar si podemos acceder al endpoint de salud
fetch(apiBaseUrl + '/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ Servidor API funcionando correctamente');
      return response.json();
    } else {
      console.log('❌ Servidor API no responde correctamente');
      throw new Error('API no disponible');
    }
  })
  .then(data => {
    console.log('✅ Respuesta del servidor:', data);
  })
  .catch(error => {
    console.log('❌ Error conectando con API:', error.message);
    console.log('🔧 Verifica que:');
    console.log('   1. El servidor backend esté corriendo');
    console.log('   2. Las variables NEXT_PUBLIC_API_BASE_URL y API_BASE_URL estén configuradas');
    console.log('   3. El dominio sea correcto: https://www.impulsa360.tech');
  });

// Verificar configuración actual
console.log('📋 Configuración actual:');
console.log('   - Dominio:', window.location.origin);
console.log('   - URL API esperada:', window.location.origin + '/api');
