import BaseRepository from './BaseRepository.js';

export class PlanRepository extends BaseRepository {
  constructor() {
    super('plans');
  }

  /**
   * Crear plan con valores por defecto
   * @param {Object} planData 
   * @returns {Promise<Object>}
   */
  async create(planData) {
    const planWithDefaults = {
      status: 'active',
      billing_cycle: 'monthly',
      ...planData
    };

    return await super.create(planWithDefaults);
  }

  /**
   * Obtener planes activos
   * @returns {Promise<Object>}
   */
  async findActive() {
    return await this.findWhere({ status: 'active' });
  }

  /**
   * Obtener planes por ciclo de facturación
   * @param {string} billingCycle 
   * @returns {Promise<Object>}
   */
  async findByBillingCycle(billingCycle) {
    return await this.findWhere({ billing_cycle: billingCycle });
  }

  /**
   * Cambiar estado del plan
   * @param {string|number} id 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async changeStatus(id, status) {
    return await this.update(id, { status });
  }

  /**
   * Activar plan
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async activate(id) {
    return await this.changeStatus(id, 'active');
  }

  /**
   * Desactivar plan
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async deactivate(id) {
    return await this.changeStatus(id, 'inactive');
  }

  /**
   * Archivar plan
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async archive(id) {
    return await this.changeStatus(id, 'archived');
  }

  /**
   * Obtener planes con sus servicios
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
          plan_services(
            id, 
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
      console.error('Error en PlanRepository.findAllWithServices:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener estadísticas de planes por estado
   * @returns {Promise<Object>}
   */
  async getStatusStats() {
    try {
      const statuses = ['active', 'inactive', 'archived'];
      const stats = {};

      for (const status of statuses) {
        const result = await this.count({ status });
        stats[status] = result.count;
      }

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error en PlanRepository.getStatusStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Obtener plan más popular (más suscripciones)
   * @returns {Promise<Object>}
   */
  async findMostPopular() {
    try {
      const { data, error } = await this.supabase
        .rpc('get_most_popular_plan');

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en PlanRepository.findMostPopular:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

export default PlanRepository;
