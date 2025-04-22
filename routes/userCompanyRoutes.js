import express from 'express';
const router = express.Router();
import { body, param } from 'express-validator';
import UserController from '../controllers/userController.ts';
import CompanyController from '../controllers/companyController.ts';
import RoleController from '../controllers/roleController.ts';
import PermissionController from '../controllers/permissionController.ts';
import RolePermissionController from '../controllers/rolePermissionController.ts';
import ClientController from '../controllers/clientController.ts';
import SocialNetworkController from '../controllers/socialNetworkController.ts';
import TeamController from '../controllers/teamController.ts';
import TeamMemberController from '../controllers/teamMemberController.ts';
import NotificationController from '../controllers/notificationController.ts';
import LeadController from '../controllers/leadController.ts';
import ActivityController from '../controllers/activityController.ts';
import authMiddleware from '../middlewares/authMiddleware.js';

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

// Rutas para Users
router.post('/users', validateUserInput, UserController.createUser);
router.get('/users', authMiddleware, UserController.getUsers);
router.get('/users/:id', authMiddleware, validateId, UserController.getUserById);
router.put('/users/:id', authMiddleware, validateId, validateUserInput, UserController.updateUser);
router.delete('/users/:id', authMiddleware, validateId, UserController.deleteUser);
router.post('/users/:id/change-password', authMiddleware, validateId, 
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ], 
  UserController.changePassword
);

// Rutas para Companies
router.post('/companies', authMiddleware, validateCompanyInput, CompanyController.createCompany);
router.get('/companies', authMiddleware, CompanyController.getCompanies);
router.get('/companies/:id', authMiddleware, validateId, CompanyController.getCompanyById);
router.put('/companies/:id', authMiddleware, validateId, validateCompanyInput, CompanyController.updateCompany);
router.delete('/companies/:id', authMiddleware, validateId, CompanyController.deleteCompany);

// Rutas para Roles
router.post('/roles', authMiddleware, validateRoleInput, RoleController.createRole);
router.get('/roles', authMiddleware, RoleController.getRoles);
router.get('/roles/:id', authMiddleware, validateId, RoleController.getRoleWithPermissions);
router.put('/roles/:id', authMiddleware, validateId, validateRoleInput, RoleController.updateRole);
router.delete('/roles/:id', authMiddleware, validateId, RoleController.deleteRole);

// Rutas para Permissions
router.post('/permissions', authMiddleware, validatePermissionInput, PermissionController.createPermission);
router.get('/permissions', authMiddleware, PermissionController.getPermissions);
router.get('/permissions/:id', authMiddleware, validateId, PermissionController.getPermissionWithRoles);
router.put('/permissions/:id', authMiddleware, validateId, validatePermissionInput, PermissionController.updatePermission);
router.delete('/permissions/:id', authMiddleware, validateId, PermissionController.deletePermission);

// Rutas para Role-Permissions
router.post('/role-permissions', authMiddleware, validateRolePermissionInput, RolePermissionController.assignPermissionToRole);
router.delete('/role-permissions/:role_id/:permission_id', authMiddleware, RolePermissionController.removePermissionFromRole);
router.get('/roles/:role_id/permissions', authMiddleware, RolePermissionController.getPermissionsByRole);
router.get('/permissions/:permission_id/roles', authMiddleware, RolePermissionController.getRolesByPermission);
router.put('/roles/:role_id/permissions', authMiddleware, RolePermissionController.updateRolePermissions);

// Rutas para Teams
router.post('/teams', authMiddleware, validateTeamInput, TeamController.createTeam);
router.get('/companies/:company_id/teams', authMiddleware, TeamController.getTeamsByCompany);
router.get('/teams/:id', authMiddleware, validateId, TeamController.getTeamWithMembers);
router.put('/teams/:id', authMiddleware, validateId, validateTeamInput, TeamController.updateTeam);
router.delete('/teams/:id', authMiddleware, validateId, TeamController.deleteTeam);

// Rutas para Team Members
router.post('/team-members', authMiddleware, validateTeamMemberInput, TeamMemberController.addTeamMember);
router.put('/teams/:team_id/members/:user_id', authMiddleware, TeamMemberController.updateTeamMemberRole);
router.delete('/teams/:team_id/members/:user_id', authMiddleware, TeamMemberController.removeTeamMember);
router.get('/users/:user_id/teams', authMiddleware, TeamMemberController.getUserTeams);

// Rutas para Notifications
router.post('/notifications', authMiddleware, validateNotificationInput, NotificationController.createNotification);
router.get('/users/:user_id/notifications', authMiddleware, NotificationController.getUserNotifications);
router.put('/notifications/:id/read', authMiddleware, NotificationController.markAsRead);
router.delete('/notifications/:id', authMiddleware, NotificationController.deleteNotification);

// Rutas para Leads
router.post('/leads', authMiddleware, validateLeadInput, LeadController.createLead);
router.get('/leads/:id', authMiddleware, LeadController.getLeadById);
router.get('/leads/status/:status', authMiddleware, LeadController.getLeadsByStatus);
router.put('/leads/:id', authMiddleware, validateLeadInput, LeadController.updateLead);
router.delete('/leads/:id', authMiddleware, LeadController.deleteLead);

// Importar los nuevos controladores
import PlanController from '../controllers/planController.ts';
import ServiceController from '../controllers/serviceController.ts';
import ClientServiceController from '../controllers/clientServiceController.ts';
import CompanyServiceController from '../controllers/companyServiceController.ts';

// Rutas para Plans
router.post('/plans', authMiddleware, validatePlanInput, PlanController.createPlan);
router.get('/companies/:company_id/plans', authMiddleware, PlanController.getPlansByCompany);
router.put('/plans/:id/status', authMiddleware, validateId, PlanController.updatePlanStatus);
router.delete('/plans/:id', authMiddleware, validateId, PlanController.deletePlan);

// Rutas para Services
router.post('/services', authMiddleware, validateServiceInput, ServiceController.createService);
router.get('/services', authMiddleware, ServiceController.getAllServices);
router.get('/services/:id', authMiddleware, validateId, ServiceController.getServiceById);
router.put('/services/:id', authMiddleware, validateId, validateServiceInput, ServiceController.updateService);
router.delete('/services/:id', authMiddleware, validateId, ServiceController.deleteService);

// Rutas para ClientServices
router.post('/client-services', authMiddleware, validateClientServiceInput, ClientServiceController.assignServiceToClient);
router.get('/clients/:client_id/services', authMiddleware, ClientServiceController.getClientServices);
router.put('/client-services/:id', authMiddleware, validateId, ClientServiceController.updateClientService);
router.put('/client-services/:id/deactivate', authMiddleware, validateId, ClientServiceController.deactivateClientService);

// Rutas para Activities
router.post('/activities', authMiddleware, validateActivityInput, ActivityController.logActivity);
router.get('/users/:user_id/activities', authMiddleware, ActivityController.getActivitiesByUser);
router.get('/teams/:team_id/activities', authMiddleware, ActivityController.getActivitiesByTeam);
router.get('/companies/:company_id/activities', authMiddleware, ActivityController.getActivitiesByCompany);
router.delete('/activities/:id', authMiddleware, ActivityController.deleteActivity);

export default router;
