import express from 'express';
import * as PlanController from '../controllers/planController.js';

const router = express.Router();

// Rutas CRUD de planes
router.get('/plans', PlanController.getAllPlans);
router.get('/plans/:id', PlanController.getPlanById);
router.post('/plans', PlanController.createPlan);
router.put('/plans/:id', PlanController.updatePlan);
router.delete('/plans/:id', PlanController.deletePlan);

export default router;
