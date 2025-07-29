import BaseRepository from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export class MeetingRepository extends BaseRepository {
  constructor() {
    super('meetings');
  }

  /**
   * Crear reunión con valores por defecto
   * @param {Object} meetingData 
   * @returns {Promise<Object>}
   */
  async create(meetingData) {
    const meetingWithDefaults = {
      status: 'scheduled',
      room_id: meetingData.room_id || this.generateRoomId(),
      is_recording: false,
      max_participants: 10,
      ...meetingData
    };

    return await super.create(meetingWithDefaults);
  }

  /**
   * Generar ID único para la sala
   * @returns {string}
   */
  generateRoomId() {
    return `room_${Date.now()}_${uuidv4().substr(0, 8)}`;
  }

  /**
   * Buscar reunión por room_id
   * @param {string} roomId 
   * @returns {Promise<Object>}
   */
  async findByRoomId(roomId) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en MeetingRepository.findByRoomId:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Obtener reuniones por organizador
   * @param {number} organizerId 
   * @returns {Promise<Object>}
   */
  async findByOrganizer(organizerId) {
    return await this.findWhere({ organizer_id: organizerId });
  }

  /**
   * Obtener reuniones por participante
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async findByParticipant(userId) {
    try {
      const { data, error } = await this.supabase
        .from('meeting_participants')
        .select(`
          meetings(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        data: data.map(item => item.meetings).filter(Boolean)
      };
    } catch (error) {
      console.error('Error en MeetingRepository.findByParticipant:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener reuniones por estado
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async findByStatus(status) {
    return await this.findWhere({ status });
  }

  /**
   * Obtener reuniones activas
   * @returns {Promise<Object>}
   */
  async findActive() {
    return await this.findWhere({ status: 'active' });
  }

  /**
   * Cambiar estado de la reunión
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
   * Iniciar reunión
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async start(id) {
    return await this.update(id, {
      status: 'active',
      started_at: new Date().toISOString()
    });
  }

  /**
   * Finalizar reunión
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async end(id) {
    return await this.update(id, {
      status: 'ended',
      ended_at: new Date().toISOString()
    });
  }

  /**
   * Iniciar grabación
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async startRecording(id) {
    return await this.update(id, {
      is_recording: true,
      recording_started_at: new Date().toISOString()
    });
  }

  /**
   * Detener grabación
   * @param {string|number} id 
   * @param {string} recordingUrl 
   * @returns {Promise<Object>}
   */
  async stopRecording(id, recordingUrl = null) {
    const updateData = {
      is_recording: false,
      recording_stopped_at: new Date().toISOString()
    };

    if (recordingUrl) {
      updateData.recording_url = recordingUrl;
    }

    return await this.update(id, updateData);
  }

  /**
   * Agregar participante a la reunión
   * @param {string|number} meetingId 
   * @param {number} userId 
   * @param {string} role - 'participant' | 'moderator'
   * @returns {Promise<Object>}
   */
  async addParticipant(meetingId, userId, role = 'participant') {
    try {
      const { data, error } = await this.supabase
        .from('meeting_participants')
        .insert([{
          meeting_id: meetingId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Participante agregado exitosamente'
      };
    } catch (error) {
      console.error('Error en MeetingRepository.addParticipant:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error agregando participante'
      };
    }
  }

  /**
   * Remover participante de la reunión
   * @param {string|number} meetingId 
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async removeParticipant(meetingId, userId) {
    try {
      const { data, error } = await this.supabase
        .from('meeting_participants')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('meeting_id', meetingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Participante removido exitosamente'
      };
    } catch (error) {
      console.error('Error en MeetingRepository.removeParticipant:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error removiendo participante'
      };
    }
  }

  /**
   * Obtener participantes de una reunión
   * @param {string|number} meetingId 
   * @returns {Promise<Object>}
   */
  async getParticipants(meetingId) {
    try {
      const { data, error } = await this.supabase
        .from('meeting_participants')
        .select(`
          *,
          users(id, username, email)
        `)
        .eq('meeting_id', meetingId);

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en MeetingRepository.getParticipants:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener reuniones con relaciones completas
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
          organizer:organizer_id(id, username, email),
          meeting_participants(
            id, role, joined_at, left_at,
            users(id, username, email)
          )
        `);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      // Ordenar por fecha de creación descendente
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
      console.error('Error en MeetingRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener estadísticas de reuniones por estado
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async getStatusStats(filters = {}) {
    try {
      const statuses = ['scheduled', 'active', 'ended', 'cancelled'];
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
      console.error('Error en MeetingRepository.getStatusStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Obtener reuniones programadas para hoy
   * @param {Object} filters 
   * @returns {Promise<Object>}
   */
  async findScheduledToday(filters = {}) {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .gte('scheduled_at', today)
        .lt('scheduled_at', `${today}T23:59:59.999Z`)
        .eq('status', 'scheduled');

      // Aplicar filtros adicionales
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en MeetingRepository.findScheduledToday:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Cancelar reunión
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
}

export default MeetingRepository;
