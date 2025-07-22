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
  res.json(req.user);
});

export default router;