const express = require('express');
const router = express.Router();
const PlanController = require('../controllers/planController');

// Rutas CRUD de planes
router.get('/plans', PlanController.getAllPlans);
router.get('/plans/:id', PlanController.getPlanById);
router.post('/plans', PlanController.createPlan);
router.put('/plans/:id', PlanController.updatePlan);
router.delete('/plans/:id', PlanController.deletePlan);

module.exports = router; 