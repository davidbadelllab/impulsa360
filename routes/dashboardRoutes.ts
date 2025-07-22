import { Router } from 'express';
import { 
  getUsersCount, 
  getCompaniesCount, 
  getAppointmentsStats, 
  getFilesStats 
} from '../controllers/dashboardController.js';

const router = Router();

// Rutas para métricas del dashboard
router.get('/users-count', getUsersCount);
router.get('/companies-count', getCompaniesCount);
router.get('/appointments-stats', getAppointmentsStats);
router.get('/files-stats', getFilesStats);

export default router; 