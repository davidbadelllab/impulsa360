import express from 'express';
import * as PlanController from '../controllers/planController.js';
import { 
  getAllCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from '../controllers/companyController.js';

const router = express.Router();

// Rutas para compañías
router.route('/companies')
  .get(getAllCompanies)
  .post(createCompany);

router.route('/companies/:id')
  .get(getCompanyById)
  .put(updateCompany)
  .delete(deleteCompany);

// Rutas CRUD de planes
router.get('/plans', PlanController.getAllPlans);
router.get('/plans/:id', PlanController.getPlanById);
router.post('/plans', PlanController.createPlan);
router.put('/plans/:id', PlanController.updatePlan);
router.delete('/plans/:id', PlanController.deletePlan);

export default router;
