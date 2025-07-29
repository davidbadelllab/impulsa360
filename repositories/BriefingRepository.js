import BaseRepository from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export class BriefingRepository extends BaseRepository {
  constructor() {
    super('briefings');
  }

  /**
   * Crear briefing con URLs y tokens únicos
   * @param {Object} briefingData 
   * @returns {Promise<Object>}
   */
  async create(briefingData) {
    try {
      // Generar valores únicos si no se proporcionan
      const briefingWithDefaults = {
        status: 'draft',
        priority: 'medium',
        public_url: briefingData.public_url || this.generateUniqueUrl(),
        access_token: briefingData.access_token || this.generateAccessToken(),
        ...briefingData
      };

      return await super.create(briefingWithDefaults);
    } catch (error) {
      console.error('Error en BriefingRepository.create:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error creando briefing'
      };
    }
  }

  /**
   * Generar URL única para el briefing
   * @returns {string}
   */
  generateUniqueUrl() {
    return `brief-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generar token de acceso único
   * @returns {string}
   */
  generateAccessToken() {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * Buscar briefing por URL pública
   * @param {string} publicUrl 
   * @returns {Promise<Object>}
   */
  async findByPublicUrl(publicUrl) {
    return await this.findWhere({ public_url: publicUrl });
  }

  /**
   * Buscar briefing por token de acceso
   * @param {string} accessToken 
   * @returns {Promise<Object>}
   */
  async findByAccessToken(accessToken) {
    return await this.findWhere({ access_token: accessToken });
  }

  /**
   * Obtener briefings por cliente
   * @param {number} clientId 
   * @returns {Promise<Object>}
   */
  async findByClient(clientId) {
    return await this.findWhere({ client_id: clientId });
  }

  /**
   * Obtener briefings por compañía
   * @param {number} companyId 
   * @returns {Promise<Object>}
   */
  async findByCompany(companyId) {
    return await this.findWhere({ company_id: companyId });
  }

  /**
   * Obtener briefings por estado
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async findByStatus(status) {
    return await this.findWhere({ status });
  }

  /**
   * Obtener briefings por prioridad
   * @param {string} priority 
   * @returns {Promise<Object>}
   */
  async findByPriority(priority) {
    return await this.findWhere({ priority });
  }

  /**
   * Obtener briefings con relaciones completas
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
          clients:client_id(id, name, email, phone),
          companies:company_id(id, name),
          categories:category_id(id, name),
          templates:template_id(id, name, description)
        `);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Ordenar por fecha de creación descendente por defecto
      query = query.order('created_at', { ascending: false });

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
      console.error('Error en BriefingRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Cambiar estado del briefing
   * @param {string|number} id 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async changeStatus(id, status) {
    const statusTimestamp = `${status}_at`;
    const updateData = {
      status,
      [statusTimestamp]: new Date().toISOString()
    };

    return await this.update(id, updateData);
  }

  /**
   * Marcar briefing como completado
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsCompleted(id) {
    return await this.changeStatus(id, 'completed');
  }

  /**
   * Marcar briefing como en progreso
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsInProgress(id) {
    return await this.changeStatus(id, 'in_progress');
  }

  /**
   * Marcar briefing como aprobado
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsApproved(id) {
    return await this.changeStatus(id, 'approved');
  }

  /**
   * Marcar briefing como rechazado
   * @param {string|number} id 
   * @param {string} reason - Razón del rechazo
   * @returns {Promise<Object>}
   */
  async markAsRejected(id, reason = null) {
    const updateData = {
      status: 'rejected',
      rejected_at: new Date().toISOString()
    };

    if (reason) {
      updateData.rejection_reason = reason;
    }

    return await this.update(id, updateData);
  }

  /**
   * Cambiar prioridad del briefing
   * @param {string|number} id 
   * @param {string} priority 
   * @returns {Promise<Object>}
   */
  async changePriority(id, priority) {
    return await this.update(id, { priority });
  }

  /**
   * Obtener estadísticas de briefings por estado
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async getStatusStats(filters = {}) {
    try {
      const statuses = ['draft', 'in_progress', 'completed', 'approved', 'rejected'];
      const stats = {};

      for (const status of statuses) {
        const result = await this.count({ ...filters, status });
        stats[status] = result.count;
      }

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error en BriefingRepository.getStatusStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Buscar briefings por rango de fechas
   * @param {string} startDate 
   * @param {string} endDate 
   * @param {Object} additionalFilters 
   * @returns {Promise<Object>}
   */
  async findByDateRange(startDate, endDate, additionalFilters = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      // Aplicar filtros adicionales
      Object.entries(additionalFilters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en BriefingRepository.findByDateRange:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Duplicar briefing
   * @param {string|number} id 
   * @param {Object} overrides - Campos a sobrescribir en la copia
   * @returns {Promise<Object>}
   */
  async duplicate(id, overrides = {}) {
    try {
      // Obtener el briefing original
      const original = await this.findById(id);
      
      if (!original.success) {
        return original;
      }

      // Crear una copia con nuevos identificadores únicos
      const { id: originalId, created_at, updated_at, ...briefingData } = original.data;
      
      const duplicatedData = {
        ...briefingData,
        ...overrides,
        title: overrides.title || `${briefingData.title} (Copia)`,
        status: 'draft',
        public_url: this.generateUniqueUrl(),
        access_token: this.generateAccessToken()
      };

      return await this.create(duplicatedData);
    } catch (error) {
      console.error('Error en BriefingRepository.duplicate:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error duplicando briefing'
      };
    }
  }
}

export default BriefingRepository;
