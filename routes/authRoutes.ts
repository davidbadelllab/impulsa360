import { Router } from 'express';
import { login, register } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { loginSchema, registerSchema } from '../schemas/authSchema.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);

export default router;
