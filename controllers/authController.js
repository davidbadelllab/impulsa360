import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Función de login con verificación directa en tabla users
export const login = async (email, password) => {
  try {
    console.log('Intentando login para:', email);
    
    // Buscar usuario en la tabla users por email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      console.error('Usuario no encontrado:', email);
      throw new Error('Credenciales inválidas');
    }
    
    console.log('Usuario encontrado, verificando contraseña...');
    
    // Verificar contraseña usando bcrypt
    const isValidPassword = await bcrypt.compare(password, userData.password);
    
    if (!isValidPassword) {
      console.error('Contraseña inválida para:', email);
      throw new Error('Credenciales inválidas');
    }
    
    console.log('Contraseña válida, generando token...');
    
    // Crear token JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_2024';
    const token = jwt.sign(
      { 
        id: userData.id,
        email: userData.email,
        username: userData.username,
        role: userData.role || 'User',
        is_superadmin: userData.is_superadmin || false,
        role_id: userData.role_id,
        company_id: userData.company_id
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login exitoso para:', email);
    return { token };
    
  } catch (error) {
    console.error('Error en login:', error.message);
    throw new Error('Error en el login: ' + error.message);
  }
};

// Middleware para autenticar token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  // Usar el mismo JWT_SECRET que el middleware
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_2024';

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error verificando token:', err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Función para obtener usuario actual
export const getCurrentUser = (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    username: 'admin_user',
    is_superadmin: true,
    avatar: null
  });
}; 