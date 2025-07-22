import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../src/errors/index.js';

export const authMiddleware = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
  }

  const token = authHeader.split(' ')[1];
  
  // Asegurarse de que tenemos un JWT_SECRET
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_2024';
  
  try {
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Añadir los datos del usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ error: 'Token no válido aún' });
    }
    
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

export default authMiddleware;
