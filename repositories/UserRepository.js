import bcrypt from 'bcryptjs';
import BaseRepository from './BaseRepository.js';

export class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  /**
   * Crear usuario con hash de contraseña
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>}
   */
  async create(userData) {
    try {
      // Hash de la contraseña si se proporciona
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      // Valores por defecto
      const userWithDefaults = {
        status: 'active',
        is_superadmin: false,
        ...userData
      };

      return await super.create(userWithDefaults);
    } catch (error) {
      console.error('Error en UserRepository.create:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error creando usuario'
      };
    }
  }

  /**
   * Actualizar usuario con hash de contraseña si se cambia
   * @param {string|number} id 
   * @param {Object} userData 
   * @returns {Promise<Object>}
   */
  async update(id, userData) {
    try {
      // Hash de la contraseña si se está actualizando
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      return await super.update(id, userData);
    } catch (error) {
      console.error('Error en UserRepository.update:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error actualizando usuario'
      };
    }
  }

  /**
   * Buscar usuario por email
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en UserRepository.findByEmail:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Verificar contraseña
   * @param {string} plainPassword 
   * @param {string} hashedPassword 
   * @returns {Promise<boolean>}
   */
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error verificando contraseña:', error);
      return false;
    }
  }

  /**
   * Obtener usuarios por compañía
   * @param {number} companyId 
   * @returns {Promise<Object>}
   */
  async findByCompany(companyId) {
    return await this.findWhere({ company_id: companyId });
  }

  /**
   * Obtener usuarios por rol
   * @param {number} roleId 
   * @returns {Promise<Object>}
   */
  async findByRole(roleId) {
    return await this.findWhere({ role_id: roleId });
  }

  /**
   * Obtener usuarios activos
   * @returns {Promise<Object>}
   */
  async findActive() {
    return await this.findWhere({ status: 'active' });
  }

  /**
   * Obtener superadministradores
   * @returns {Promise<Object>}
   */
  async findSuperAdmins() {
    return await this.findWhere({ is_superadmin: true });
  }

  /**
   * Cambiar contraseña de usuario
   * @param {string|number} id 
   * @param {string} newPassword 
   * @returns {Promise<Object>}
   */
  async changePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      return await this.update(id, { 
        password: hashedPassword,
        password_changed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error cambiando contraseña'
      };
    }
  }

  /**
   * Desactivar usuario
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    return await this.update(id, { 
      status: 'inactive',
      deactivated_at: new Date().toISOString()
    });
  }

  /**
   * Activar usuario
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async activate(id) {
    return await this.update(id, { 
      status: 'active',
      activated_at: new Date().toISOString()
    });
  }

  /**
   * Obtener usuarios con información de rol y compañía
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async findAllWithRelations(options = {}) {
    try {
      const { filters = {}, limit = null, offset = null } = options;

      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          roles:role_id(id, name, description),
          companies:company_id(id, name, email)
        `);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Aplicar paginación
      if (limit) query = query.limit(limit);
      if (offset) query = query.range(offset, offset + (limit || 1000) - 1);

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en UserRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

export default UserRepository;
