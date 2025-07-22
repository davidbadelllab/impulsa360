import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware para proteger rutas
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;
    
    // Verificar si hay token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Acceso no autorizado' });
      return;
    }
    
    // Verificar el token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Añadir el usuario a la request
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Acceso no autorizado' });
  }
};

// Middleware para verificar roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: 'Usuario no autorizado para acceder a este recurso'
      });
      return;
    }
    
    next();
  };
}; 