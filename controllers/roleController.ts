const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const RoleController = {
  // Create role
  async createRole(req, res) {
    try {
      const { name, description } = req.body;
      
      const newRole = await db('roles').insert({
        name,
        description
      }).returning('*');
      
      res.status(201).json(newRole[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get all roles
  async getRoles(req, res) {
    try {
      const roles = await db('roles').select('*');
      res.json(roles);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Get role with permissions
  async getRoleWithPermissions(req, res) {
    try {
      const role = await db('roles')
        .where({ 'roles.id': req.params.id })
        .first();
      
      if (!role) return res.status(404).json({ error: 'Role not found' });

      const permissions = await db('role_permissions')
        .where({ role_id: req.params.id })
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .select('permissions.*');

      res.json({ ...role, permissions });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const updated = await db('roles')
        .where({ id })
        .update({ name, description })
        .returning('*');
        
      if (!updated.length) return res.status(404).json({ error: 'Role not found' });
      res.json(updated[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Delete role
  async deleteRole(req, res) {
    try {
      // Verificar si hay usuarios con este rol primero
      const users = await db('users').where({ role_id: req.params.id });
      if (users.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete role assigned to users' 
        });
      }
      
      // Eliminar relaciones primero
      await db('role_permissions').where({ role_id: req.params.id }).del();
      
      const deleted = await db('roles')
        .where({ id: req.params.id })
        .del()
        .returning('*');
        
      if (!deleted.length) return res.status(404).json({ error: 'Role not found' });
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = RoleController;
