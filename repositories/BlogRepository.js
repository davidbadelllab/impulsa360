import BaseRepository from './BaseRepository.js';

export class BlogRepository extends BaseRepository {
  constructor() {
    super('blogs');
  }

  /**
   * Obtener blog por autor
   * @param {number} authorId 
   * @returns {PromiseObject}
   */
  async findByAuthor(authorId) {
    return await this.findWhere({ author_id: authorId });
  }

  /**
   * Obtener blogs por categoría
   * @param {number} categoryId 
   * @returns {PromiseObject}
   */
  async findByCategory(categoryId) {
    return await this.findWhere({ category_id: categoryId });
  }

  /**
   * Cambiar estado del blog
   * @param {string|number} id 
   * @param {string} status 
   * @returns {PromiseObject}
   */
  async changeStatus(id, status) {
    return await this.update(id, { status });
  }

  /**
   * Marcar blog como publicado
   * @param {string|number} id 
   * @returns {PromiseObject}
   */
  async markAsPublished(id) {
    return await this.changeStatus(id, 'published');
  }

  /**
   * Marcar blog como borrador
   * @param {string|number} id 
   * @returns {PromiseObject}
   */
  async markAsDraft(id) {
    return await this.changeStatus(id, 'draft');
  }

  /**
   * Obtener blogs con relaciones completas
   * @param {Object} options 
   * @returns {PromiseObject}
   */
  async findAllWithRelations(options = {}) {
    try {
      const { filters = {}, limit = null, offset = null } = options;

      let query = this.supabase
        .from(this.tableName)
        .select(`
          *,
          author:author_id(id, name, email),
          category:category_id(id, name, description)
        `);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
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
      console.error('Error en BlogRepository.findAllWithRelations:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener estadísticas de blogs por estado
   * @param {Object} filters 
   * @returns {PromiseObject}
   */
  async getStatusStats(filters = {}) {
    try {
      const statuses = ['draft', 'published', 'archived'];
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
      console.error('Error en BlogRepository.getStatusStats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }
}

export default BlogRepository;
