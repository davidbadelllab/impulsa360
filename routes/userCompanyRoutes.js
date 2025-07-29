import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Validaciones comunes
const validateId = param('id').isInt().withMessage('ID must be an integer');
const validateRoleInput = [
  body('name').notEmpty().withMessage('Role name is required'),
  body('description').optional().isString()
];

const validatePermissionInput = [
  body('name').notEmpty().withMessage('Permission name is required'),
  body('description').optional().isString()
];

const validateRolePermissionInput = [
  body('role_id').isInt().withMessage('Role ID must be an integer'),
  body('permission_id').isInt().withMessage('Permission ID must be an integer')
];
const validateUserInput = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role_id').optional().isInt(),
  body('company_id').optional().isInt(),
  body('is_superadmin').optional().isBoolean()
];

const validateCompanyInput = [
  body('name').notEmpty().withMessage('Company name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('address').optional().isString()
];

const validateNotificationInput = [
  body('user_id').isInt().withMessage('User ID must be an integer'),
  body('message').notEmpty().withMessage('Message is required')
];

const validateLeadInput = [
  body('client_id').isInt().withMessage('Client ID must be an integer'),
  body('social_network_id').isInt().withMessage('Social Network ID must be an integer'),
  body('status').optional().isString(),
  body('notes').optional().isString()
];

const validateActivityInput = [
  body('user_id').isInt().withMessage('User ID must be an integer'),
  body('description').notEmpty().withMessage('Description is required'),
  body('company_id').optional().isInt(),
  body('team_id').optional().isInt()
];

const validatePlanInput = [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('description').optional().isString(),
  body('status').optional().isString(),
  body('company_id').isInt().withMessage('Company ID must be an integer'),
  body('team_id').optional().isInt()
];

const validateServiceInput = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').optional().isString(),
  body('price_per_month').isFloat().withMessage('Price must be a number')
];

const validateClientServiceInput = [
  body('client_id').isInt().withMessage('Client ID must be an integer'),
  body('service_id').isInt().withMessage('Service ID must be an integer'),
  body('start_date').isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid date')
];

const validateTeamInput = [
  body('name').notEmpty().withMessage('Team name is required'),
  body('description').optional().isString(),
  body('company_id').isInt().withMessage('Company ID must be an integer')
];

const validateTeamMemberInput = [
  body('team_id').isInt().withMessage('Team ID must be an integer'),
  body('user_id').isInt().withMessage('User ID must be an integer'),
  body('role').optional().isString()
];

const validateCompanyServiceInput = [
  body('company_id').isInt().withMessage('Company ID must be an integer'),
  body('service_id').isInt().withMessage('Service ID must be an integer'),
  body('start_date').isISO8601().withMessage('Start date must be a valid date'),
  body('end_date').optional().isISO8601().withMessage('End date must be a valid date')
];

// Rutas para Users - COMENTADAS porque ahora están en server.js
// Se movieron las rutas de users a server.js para evitar conflictos
/*
router.put('/users/:id', authMiddleware, async (req, res) => {
  // ... código comentado ...
});

router.post('/users/:id/reset-password', authMiddleware, async (req, res) => {
  // ... código comentado ...
});

router.delete('/users/:id', authMiddleware, async (req, res) => {
  // ... código comentado ...
});

router.get('/users/:id', authMiddleware, async (req, res) => {
  // ... código comentado ...
});

router.post('/users', authMiddleware, async (req, res) => {
  // ... código comentado ...
});
*/

// Otras rutas comentadas temporalmente hasta crear controladores JS
// TODO: Convertir controladores TS a JS cuando sea necesario
// 
// Rutas para Companies - ya manejadas en companyRoutes.js
// Rutas para Roles, Permissions, Teams, etc. - comentadas por ahora

// Rutas para Activities - comentadas temporalmente
// TODO: Implementar cuando sea necesario

export default router;
