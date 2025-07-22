import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
  // Boards
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  // Lists
  createList,
  updateList,
  deleteList,
  // Cards
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  // Labels
  createLabel,
  assignLabelToCard,
  removeLabelFromCard,
  // Assignments
  assignUserToCard,
  removeUserFromCard,
  // Comments
  createComment,
  deleteComment,
  // Checklists
  createChecklist,
  createChecklistItem,
  updateChecklistItem,
  // Attachments
  createAttachment,
  deleteAttachment,
  // Users
  getUsers,
  // Test
  testSupabase
} from '../controllers/taskController.js';

const router = Router();

// ===== TEST ===== (Sin autenticación para pruebas)
router.get('/test-supabase', testSupabase);

// Aplicar middleware de autenticación a todas las demás rutas
router.use(authMiddleware);

// ===== BOARDS =====
router.get('/boards', getBoards);
router.post('/boards', createBoard);
router.put('/boards/:id', updateBoard);
router.delete('/boards/:id', deleteBoard);

// ===== LISTS =====
router.post('/lists', createList);
router.put('/lists/:id', updateList);
router.delete('/lists/:id', deleteList);

// ===== CARDS =====
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);
router.put('/cards/move', moveCard);

// ===== LABELS =====
router.post('/labels', createLabel);
router.post('/card-labels', assignLabelToCard);
router.delete('/card-labels/:card_id/:label_id', removeLabelFromCard);

// ===== ASSIGNMENTS =====
router.post('/assignments', assignUserToCard);
router.delete('/assignments/:card_id/:user_id', removeUserFromCard);

// ===== COMMENTS =====
router.post('/comments', createComment);
router.delete('/comments/:id', deleteComment);

// ===== CHECKLISTS =====
router.post('/checklists', createChecklist);
router.post('/checklist-items', createChecklistItem);
router.put('/checklist-items/:id', updateChecklistItem);

// ===== ATTACHMENTS =====
router.post('/attachments', createAttachment);
router.delete('/attachments/:id', deleteAttachment);

// ===== USERS =====
router.get('/users', getUsers);

// ===== TEST =====
router.get('/test-supabase', testSupabase); // Sin middleware de auth para pruebas

export default router; 