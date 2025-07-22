import fetch from 'node-fetch';

async function testServerConfig() {
  try {
    console.log('🧪 Probando configuración del servidor...');
    
    // Probar el endpoint de prueba
    const response = await fetch('http://localhost:3000/api/tasks/test-supabase', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📊 Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Configuración del servidor:', result);
    } else {
      const error = await response.json();
      console.log('❌ Error del servidor:', error);
    }
    
  } catch (error) {
    console.error('💥 Error conectando al servidor:', error);
  }
}

testServerConfig(); 