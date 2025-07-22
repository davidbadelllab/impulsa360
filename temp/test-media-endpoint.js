const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testEndpoint() {
  try {
    // Obtener usuario actualizado
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@impulsa360.com')
      .single();
    
    console.log('Usuario actual:', {
      id: user.id,
      email: user.email,
      username: user.username,
      company_id: user.company_id,
      role_id: user.role_id
    });
    
    // Generar nuevo token
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_2024';
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'User',
        is_superadmin: user.is_superadmin || false,
        role_id: user.role_id,
        company_id: user.company_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Token generado exitosamente');
    console.log('Payload del token:', jwt.decode(token));
    
    // Probar endpoint
    const response = await fetch('http://localhost:3000/api/media/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoint(); 