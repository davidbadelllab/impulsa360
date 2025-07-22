import express from 'express';
import { 
  getAllCompanies, 
  getCompanyById, 
  createCompany, 
  updateCompany, 
  deleteCompany 
} from '../controllers/companyController';
import PlanController from '../controllers/planController';
import CompanyPlanController from '../controllers/companyPlanController';

const router = express.Router();

// Rutas para compañías
router.route('/')
  .get(getAllCompanies)
  .post(createCompany);

router.route('/:id')
  .get(getCompanyById)
  .put(updateCompany)
  .delete(deleteCompany);

// Rutas CRUD de planes
router.get('/plans', PlanController.getAllPlans);
router.get('/plans/:id', PlanController.getPlanById);
router.post('/plans', PlanController.createPlan);
router.put('/plans/:id', PlanController.updatePlan);
router.delete('/plans/:id', PlanController.deletePlan);

// Relación empresa-plan
router.get('/companies/:companyId/plans', CompanyPlanController.getPlansByCompany);
router.post('/company-plans', CompanyPlanController.assignPlanToCompany);
router.put('/company-plans/:id/payment-status', CompanyPlanController.updatePaymentStatus);
router.delete('/company-plans/:id', CompanyPlanController.deleteCompanyPlan);

export default router; 