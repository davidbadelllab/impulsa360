import express from 'express';
import * as mediaController from '../controllers/mediaController.js';
import { uploadMiddleware } from '../controllers/mediaController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para carpetas y archivos
router.get('/items', mediaController.getMediaItems);
router.post('/folder', mediaController.createFolder);
router.post('/upload', uploadMiddleware, mediaController.uploadFile);
router.delete('/folder/:id', mediaController.deleteFolder);
router.delete('/file/:id', mediaController.deleteFile);
router.get('/download/:id', mediaController.downloadFile);

// Rutas para compartir
router.post('/share/file', mediaController.shareFile);
router.post('/share/folder', mediaController.shareFolder);
router.get('/users', mediaController.getUsersForSharing);

export default router; 