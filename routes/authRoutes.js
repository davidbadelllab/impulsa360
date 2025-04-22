import express from 'express';
import * as authController from '../controllers/authController.ts';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await authController.login(email, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/user', authController.authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router;