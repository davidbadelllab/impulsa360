import BaseRepository from './BaseRepository.js';

export class TaskRepository extends BaseRepository {
  constructor() {
    super('tasks');
  }

  /**
   * Obtener tareas por usuario asignado
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async findByUser(userId) {
    return await this.findWhere({ assigned_to: userId });
  }

  /**
   * Obtener tareas por proyecto
   * @param {number} projectId 
   * @returns {Promise<Object>}
   */
  async findByProject(projectId) {
    return await this.findWhere({ project_id: projectId });
  }

  /**
   * Cambiar estado de la tarea
   * @param {string|number} id 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async changeStatus(id, status) {
    return await this.update(id, { status });
  }

  /**
   * Marcar tarea como completada
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsCompleted(id) {
    return await this.changeStatus(id, 'completed');
  }

  /**
   * Marcar tarea como en progreso
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async markAsInProgress(id) {
    return await this.changeStatus(id, 'in_progress');
  }

  /**
   * Obtener tareas con relaciones completas
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
          users:assigned_to(id, username, email),
          projects:project_id(id, name, description)
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
      console.error('Error en TaskRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

export default TaskRepository;
