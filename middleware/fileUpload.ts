import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/companies/');
  },
  filename: (req, file, cb) => {
    // Crear un nombre de archivo único
    cb(null, `company_${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro para tipos de archivos permitidos
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes') as any);
  }
};

// Crear middleware para subir logos de compañías
export const uploadCompanyLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
}).single('logo'); 