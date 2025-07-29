import { Router } from 'express';
import briefingController from '../controllers/briefingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();



// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas CRUD para briefings
router.get('/', briefingController.index);
router.get('/:id', briefingController.show);
router.post('/', briefingController.create);
router.put('/:id', briefingController.update);
router.delete('/:id', briefingController.delete);

// Rutas específicas para empresa-briefing
router.get('/company/:companyId', briefingController.getByCompany);
router.post('/assign', briefingController.assignToCompany);

export default router;
