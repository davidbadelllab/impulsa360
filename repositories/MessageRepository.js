import BaseRepository from './BaseRepository.js';

export class MessageRepository extends BaseRepository {
  constructor() {
    super('messages');
  }

  /**
   * Crear mensaje con estado por defecto
   * @param {Object} messageData 
   * @returns {Promise<Object>}
   */
  async create(messageData) {
    const messageWithDefaults = {
      status: 'sent',
      is_read: false,
      ...messageData
    };

    return await super.create(messageWithDefaults);
  }

  /**
   * Obtener mensajes por remitente
   * @param {number} senderId 
   * @returns {Promise<Object>}
   */
  async findBySender(senderId) {
    return await this.findWhere({ sender_id: senderId });
  }

  /**
   * Obtener mensajes por destinatario
   * @param {number} receiverId 
   * @returns {Promise<Object>}
   */
  async findByReceiver(receiverId) {
    return await this.findWhere({ receiver_id: receiverId });
  }

  /**
   * Obtener conversación entre dos usuarios
   * @param {number} user1Id 
   * @param {number} user2Id 
   * @returns {Promise<Object>}
   */
  async findConversation(user1Id, user2Id) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
        .order('created_at', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en MessageRepository.findConversation:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Marcar mensaje como leído
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsRead(id) {
    return await this.update(id, {
      is_read: true,
      read_at: new Date().toISOString()
    });
  }

  /**
   * Marcar varios mensajes como leídos
   * @param {Array} messageIds 
   * @returns {Promise<Object>}
   */
  async markMultipleAsRead(messageIds) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .in('id', messageIds)
        .select();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Mensajes marcados como leídos'
      };
    } catch (error) {
      console.error('Error en MessageRepository.markMultipleAsRead:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error marcando mensajes como leídos'
      };
    }
  }

  /**
   * Obtener mensajes no leídos por usuario
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async findUnreadByUser(userId) {
    return await this.findWhere({
      receiver_id: userId,
      is_read: false
    });
  }

  /**
   * Contar mensajes no leídos por usuario
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async countUnreadByUser(userId) {
    return await this.count({
      receiver_id: userId,
      is_read: false
    });
  }

  /**
   * Obtener mensajes con información de usuarios
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
          sender:sender_id(id, username, email),
          receiver:receiver_id(id, username, email)
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
      console.error('Error en MessageRepository.findAllWithUsers:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener lista de conversaciones únicas para un usuario
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async findConversationsList(userId) {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_conversations', { user_id: userId });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error en MessageRepository.findConversationsList:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Eliminar conversación completa entre dos usuarios
   * @param {number} user1Id 
   * @param {number} user2Id 
   * @returns {Promise<Object>}
   */
  async deleteConversation(user1Id, user2Id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .delete()
        .or(`and(sender_id.eq.${user1Id},receiver_id.eq.${user2Id}),and(sender_id.eq.${user2Id},receiver_id.eq.${user1Id})`)
        .select();

      if (error) throw error;

      return {
        success: true,
        data,
        message: 'Conversación eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error en MessageRepository.deleteConversation:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error eliminando conversación'
      };
    }
  }
}

export default MessageRepository;
