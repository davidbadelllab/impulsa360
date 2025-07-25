import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    const { token } = await authController.login(email, password);
    console.log('Login successful for:', email);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

router.get('/user', authController.authenticateToken, (req, res) => {
  // Obtener los datos reales del usuario desde el token JWT decodificado
  const user = req.user;
  
  res.json({
    id: user.id,
    username: user.username || user.email?.split('@')[0] || 'Usuario',
    email: user.email,
    role: user.role || 'Usuario',
    is_superadmin: user.is_superadmin || false,
    role_id: user.role_id,
    company_id: user.company_id,
    avatar: null
  });
});

export default router;