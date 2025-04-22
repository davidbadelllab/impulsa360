const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const PermissionController = {
  // Create permission
  async createPermission(req, res) {
    try {
      const { name, description } = req.body;
      
      const newPermission = await db('permissions').insert({
        name,
        description
      }).returning('*');
      
      res.status(201).json(newPermission[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get all permissions
  async getPermissions(req, res) {
    try {
      const permissions = await db('permissions').select('*');
      res.json(permissions);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get permission with roles
  async getPermissionWithRoles(req, res) {
    try {
      const permission = await db('permissions')
        .where({ 'permissions.id': req.params.id })
        .first();
      
      if (!permission) return res.status(404).json({ error: 'Permission not found' });

      const roles = await db('role_permissions')
        .where({ permission_id: req.params.id })
        .join('roles', 'role_permissions.role_id', 'roles.id')
        .select('roles.*');

      res.json({ ...permission, roles });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update permission
  async updatePermission(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const updated = await db('permissions')
        .where({ id })
        .update({ name, description })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Permission not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Delete permission
  async deletePermission(req, res) {
    try {
      // Verificar si hay roles con este permiso primero
      const rolePermissions = await db('role_permissions')
        .where({ permission_id: req.params.id });
      
      if (rolePermissions.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete permission assigned to roles' 
        });
      }
      
      const deleted = await db('permissions')
        .where({ id: req.params.id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Permission not found' });
      res.json({ message: 'Permission deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = PermissionController;
