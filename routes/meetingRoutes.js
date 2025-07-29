import { Router } from 'express';
import meetingController from '../controllers/meetingController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Crear nueva reunión
router.post('/', meetingController.createMeeting);

// Obtener reunión por roomId
router.get('/room/:roomId', meetingController.getMeetingByRoom);

// Unirse a reunión
router.post('/join/:roomId', meetingController.joinMeeting);

// Finalizar reunión
router.post('/end/:roomId', meetingController.endMeeting);

// Obtener todas las reuniones del usuario
router.get('/user', meetingController.getUserMeetings);

// Actualizar configuración de reunión
router.put('/settings/:roomId', meetingController.updateMeetingSettings);

export default router;
