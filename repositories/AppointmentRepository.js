import BaseRepository from './BaseRepository.js';

export class AppointmentRepository extends BaseRepository {
  constructor() {
    super('appointments');
  }

  /**
   * Crear cita con valores por defecto
   * @param {Object} appointmentData 
   * @returns {Promise<Object>}
   */
  async create(appointmentData) {
    const appointmentWithDefaults = {
      status: 'scheduled',
      is_confirmed: false,
      ...appointmentData
    };

    return await super.create(appointmentWithDefaults);
  }

  /**
   * Obtener citas por usuario
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async findByUser(userId) {
    return await this.findWhere({ user_id: userId });
  }

  /**
   * Obtener citas por cliente
   * @param {number} clientId 
   * @returns {Promise<Object>}
   */
  async findByClient(clientId) {
    return await this.findWhere({ client_id: clientId });
  }

  /**
   * Obtener citas por estado
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async findByStatus(status) {
    return await this.findWhere({ status });
  }

  /**
   * Obtener citas por rango de fechas
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
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate);

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
      console.error('Error en AppointmentRepository.findByDateRange:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Cambiar estado de la cita
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
   * Confirmar cita
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async confirm(id) {
    return await this.update(id, {
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
      status: 'confirmed'
    });
  }

  /**
   * Cancelar cita
   * @param {string|number} id 
   * @param {string} reason 
   * @returns {Promise<Object>}
   */
  async cancel(id, reason = null) {
    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    };

    if (reason) {
      updateData.cancellation_reason = reason;
    }

    return await this.update(id, updateData);
  }

  /**
   * Completar cita
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async complete(id) {
    return await this.changeStatus(id, 'completed');
  }

  /**
   * Reprogramar cita
   * @param {string|number} id 
   * @param {string} newDate 
   * @param {string} newTime 
   * @returns {Promise<Object>}
   */
  async reschedule(id, newDate, newTime) {
    return await this.update(id, {
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'rescheduled',
      rescheduled_at: new Date().toISOString()
    });
  }

  /**
   * Obtener citas con relaciones completas
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
          users:user_id(id, username, email),
          clients:client_id(id, name, email, phone),
          services:service_id(id, name, description, duration)
        `);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Ordenar por fecha de cita
      query = query.order('appointment_date', { ascending: true });

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
      console.error('Error en AppointmentRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener citas de hoy
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async findToday(filters = {}) {
    const today = new Date().toISOString().split('T')[0];
    return await this.findByDateRange(today, today, filters);
  }

  /**
   * Obtener citas de la semana
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async findThisWeek(filters = {}) {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return await this.findByDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0],
      filters
    );
  }

  /**
   * Obtener estadísticas de citas por estado
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async getStatusStats(filters = {}) {
    try {
      const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
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
      console.error('Error en AppointmentRepository.getStatusStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Verificar disponibilidad de horario
   * @param {string} date 
   * @param {string} time 
   * @param {number} excludeId - ID de cita a excluir (para reprogramaciones)
   * @returns {Promise<Object>}
   */
  async checkAvailability(date, time, excludeId = null) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('id')
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .neq('status', 'cancelled');

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        available: data.length === 0,
        conflictingAppointments: data
      };
    } catch (error) {
      console.error('Error en AppointmentRepository.checkAvailability:', error);
      return {
        success: false,
        error: error.message,
        available: false
      };
    }
  }
}

export default AppointmentRepository;
