import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  deleteMessage,
  getMessageStats,
  getUsers,
  findOrCreateDirectConversation,
  sendTypingStatus,
  getTypingUsers
} from '../controllers/messageController.js';

const router = express.Router();

// Rutas para usuarios
router.get('/users', getUsers);

// Rutas para conversaciones
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.post('/conversations/direct', findOrCreateDirectConversation);

// Rutas para mensajes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/conversations/:conversationId/read', markAsRead);
router.delete('/messages/:messageId', deleteMessage);

// Estadísticas
router.get('/stats', getMessageStats);

// Rutas para typing (escribiendo)
router.post('/typing', sendTypingStatus);
router.get('/typing/:conversationId', getTypingUsers);

export default router; 