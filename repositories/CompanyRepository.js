import BaseRepository from './BaseRepository.js';

export class CompanyRepository extends BaseRepository {
  constructor() {
    super('companies');
  }

  /**
   * Buscar compañía por email
   * @param {string} email 
   * @returns {Promise<Object>}
   */
  async findByEmail(email) {
    return await this.findWhere({ email });
  }

  /**
   * Obtener compañías activas
   * @returns {Promise<Object>}
   */
  async findActive() {
    return await this.findWhere({ status: 'active' });
  }

  /**
   * Obtener compañías con sus usuarios
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async findAllWithUsers(options = {}) {
    try {
      const { filters = {}, limit = null, offset = null } = options;

      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          users(id, username, email, status, role_id)
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
      console.error('Error en CompanyRepository.findAllWithUsers:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener compañías con sus servicios contratados
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async findAllWithServices(options = {}) {
    try {
      const { filters = {}, limit = null, offset = null } = options;

      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          company_services(
            id, start_date, end_date, status,
            services(id, name, description, price_per_month)
          )
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
      console.error('Error en CompanyRepository.findAllWithServices:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener estadísticas de la compañía
   * @param {string|number} companyId 
   * @returns {Promise<Object>}
   */
  async getStats(companyId) {
    try {
      // Contar usuarios
      const usersCount = await this.supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      // Contar equipos
      const teamsCount = await this.supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      // Contar clientes
      const clientsCount = await this.supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);

      // Contar servicios activos
      const activeServicesCount = await this.supabase
        .from('company_services')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      return {
        success: true,
        stats: {
          users: usersCount.count || 0,
          teams: teamsCount.count || 0,
          clients: clientsCount.count || 0,
          activeServices: activeServicesCount.count || 0
        }
      };
    } catch (error) {
      console.error('Error en CompanyRepository.getStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Crear compañía con valores por defecto
   * @param {Object} companyData 
   * @returns {Promise<Object>}
   */
  async create(companyData) {
    const companyWithDefaults = {
      status: 'active',
      subscription_status: 'trial',
      ...companyData
    };

    return await super.create(companyWithDefaults);
  }

  /**
   * Activar compañía
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
   * Desactivar compañía
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
   * Suspender compañía
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async suspend(id) {
    return await this.update(id, { 
      status: 'suspended',
      suspended_at: new Date().toISOString()
    });
  }
}

export default CompanyRepository;
