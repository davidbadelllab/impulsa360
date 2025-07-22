import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentStats
} from '../controllers/appointmentController.js';

const router = express.Router();

// Rutas públicas
router.post('/', createAppointment);

// Rutas protegidas (requieren autenticación)
router.get('/', getAppointments);
router.get('/stats', getAppointmentStats);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router; 