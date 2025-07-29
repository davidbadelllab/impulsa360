import { Router } from 'express';
import briefingController from '../controllers/briefingController.js';

const router = Router();

// ===== RUTAS PÚBLICAS (para clientes) =====
router.get('/categories', briefingController.getCategories);
router.get('/templates', briefingController.getTemplates);
router.get('/templates/category/:categoryId', briefingController.getTemplatesByCategory);
router.get('/templates/:id', briefingController.getTemplate);
router.get('/public/:publicUrl', briefingController.getPublicBriefing);
router.post('/public/:publicUrl/submit', briefingController.submitBriefing);
router.put('/public/:publicUrl/progress', briefingController.updateProgress);

// ===== RUTAS ADMIN =====
router.get('/', briefingController.index);
router.get('/status/:status', briefingController.getByStatus);
router.get('/:id', briefingController.show);
router.post('/create', briefingController.createBriefing);
router.put('/:id', briefingController.update);
router.delete('/:id', briefingController.delete);

// ===== RUTAS DE TEMPLATES (admin) =====
router.post('/templates', briefingController.createTemplate);

// ===== RUTAS DE ESTADÍSTICAS =====
router.get('/stats/overview', briefingController.getStats);
router.get('/stats/templates', briefingController.getTemplateMetrics);

// ===== RUTAS DE COMENTARIOS =====
router.get('/:briefingId/comments', briefingController.getComments);
router.post('/:briefingId/comments', briefingController.addComment);

export default router;
