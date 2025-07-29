#!/usr/bin/env node

// Test para verificar que los endpoints de usuarios funcionan correctamente
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(method, endpoint, data = null) {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const responseData = await response.text();
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📄 Response:`, responseData);
        
        return {
            status: response.status,
            data: responseData,
            success: response.status < 400
        };
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        return {
            status: 500,
            error: error.message,
            success: false
        };
    }
}

async function runTests() {
    console.log('🚀 Iniciando pruebas de endpoints de usuarios...\n');

    // Test 1: GET /api/users
    await testEndpoint('GET', '/users');

    // Test 2: POST /api/users (crear usuario)
    const testUser = {
        username: 'test_user_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'password123',
        role_id: 1,
        company_id: 1
    };
    
    const createResult = await testEndpoint('POST', '/users', testUser);
    
    // Extraer ID del usuario creado si fue exitoso
    let userId = null;
    if (createResult.success) {
        try {
            const parsed = JSON.parse(createResult.data);
            userId = parsed.data?.id;
            console.log(`✅ Usuario creado con ID: ${userId}`);
        } catch (e) {
            console.log('⚠️ No se pudo extraer el ID del usuario');
        }
    }

    // Test 3: PUT /api/users/:id (actualizar usuario) - solo si se creó exitosamente
    if (userId) {
        await testEndpoint('PUT', `/users/${userId}`, {
            username: 'updated_user_' + Date.now()
        });
    }

    // Test 4: DELETE /api/users/:id (eliminar usuario) - solo si se creó exitosamente
    if (userId) {
        await testEndpoint('DELETE', `/users/${userId}`);
    }

    console.log('\n✅ Pruebas completadas');
}

// Verificar que el servidor esté corriendo
async function checkServer() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        return response.status !== undefined;
    } catch (error) {
        return false;
    }
}

// Ejecutar las pruebas
checkServer().then(isRunning => {
    if (isRunning) {
        runTests();
    } else {
        console.log('❌ El servidor no está corriendo en http://localhost:3000');
        console.log('💡 Por favor, inicia el servidor con: npm run dev');
    }
});
