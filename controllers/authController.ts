import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { Request, Response, NextFunction } from 'express';

// Validar variables de entorno
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_JWT_SECRET) {
  throw new Error('Missing required environment variables');
}

// Configuración Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

interface LoginResponse {
  token: string;
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  try {
    // Buscar usuario en Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
    return;
  } catch (error) {
    next(error);
  }
};

interface RegisterResponse {
  token: string;
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear nuevo usuario en Supabase
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        { 
          email,
          password: hashedPassword,
          name,
          role: 'user' 
        }
      ])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ token });
    return;
  } catch (error) {
    next(error);
  }
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
