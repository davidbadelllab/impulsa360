const db = require('../lib/db');
const { validationResult } = require('express-validator');

const handleError = (res, error, status = 500) => {
  console.error(error);
  res.status(status).json({ error: error.message });
};

const RolePermissionController = {
  // Asignar permiso a rol
  async assignPermissionToRole(req, res) {
    try {
      const { role_id, permission_id } = req.body;

      // Verificar si ya existe la relación
      const exists = await db('role_permissions')
        .where({ role_id, permission_id })
        .first();
      
      if (exists) {
        return res.status(400).json({ 
          error: 'Permission already assigned to this role' 
        });
      }

      // Verificar que existan el rol y el permiso
      const role = await db('roles').where({ id: role_id }).first();
      const permission = await db('permissions').where({ id: permission_id }).first();
      
      if (!role || !permission) {
        return res.status(404).json({ 
          error: 'Role or Permission not found' 
        });
      }

      const newRelation = await db('role_permissions')
        .insert({ role_id, permission_id })
        .returning('*');
      
      res.status(201).json(newRelation[0]);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Remover permiso de rol
  async removePermissionFromRole(req, res) {
    try {
      const { role_id, permission_id } = req.params;

      const deleted = await db('role_permissions')
        .where({ role_id, permission_id })
        .del()
        .returning('*');
        
      if (!deleted.length) {
        return res.status(404).json({ 
          error: 'Permission not assigned to this role' 
        });
      }
      
      res.json({ message: 'Permission removed from role successfully' });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener permisos por rol
  async getPermissionsByRole(req, res) {
    try {
      const permissions = await db('role_permissions')
        .where({ role_id: req.params.role_id })
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .select('permissions.*');
      
      res.json(permissions);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Obtener roles por permiso
  async getRolesByPermission(req, res) {
    try {
      const roles = await db('role_permissions')
        .where({ permission_id: req.params.permission_id })
        .join('roles', 'role_permissions.role_id', 'roles.id')
        .select('roles.*');
      
      res.json(roles);
    } catch (error) {
      handleError(res, error);
    }
  },

  // Actualizar múltiples permisos para un rol
  async updateRolePermissions(req, res) {
    try {
      const { role_id } = req.params;
      const { permissions } = req.body; // Array de permission_ids

      await db.transaction(async trx => {
        // Eliminar relaciones existentes
        await trx('role_permissions')
          .where({ role_id })
          .del();

        // Insertar nuevas relaciones
        if (permissions && permissions.length > 0) {
          const relations = permissions.map(permission_id => ({
            role_id,
            permission_id
          }));
          
          await trx('role_permissions')
            .insert(relations);
        }

        res.json({ message: 'Role permissions updated successfully' });
      });
    } catch (error) {
      handleError(res, error);
    }
  }
};

module.exports = RolePermissionController;
