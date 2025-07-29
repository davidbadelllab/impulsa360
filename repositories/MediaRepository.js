import BaseRepository from './BaseRepository.js';

export class MediaRepository extends BaseRepository {
  constructor() {
    super('media');
  }

  /**
   * Obtener media por tipo
   * @param {string} type 
   * @returns {PromiseObject}
   */
  async findByType(type) {
    return await this.findWhere({ type });
  }

  /**
   * Obtener media por usuario
   * @param {number} userId 
   * @returns {PromiseObject}
   */
  async findByUser(userId) {
    return await this.findWhere({ user_id: userId });
  }

  /**
   * Obtener media por compañía
   * @param {number} companyId 
   * @returns {PromiseObject}
   */
  async findByCompany(companyId) {
    return await this.findWhere({ company_id: companyId });
  }

  /**
   * Obtener media por cliente
   * @param {number} clientId 
   * @returns {PromiseObject}
   */
  async findByClient(clientId) {
    return await this.findWhere({ client_id: clientId });
  }

  /**
   * Marcar media como vista
   * @param {string|number} id 
   * @returns {PromiseObject}
   */
  async markAsViewed(id) {
    return await this.update(id, {
      is_viewed: true,
      viewed_at: new Date().toISOString()
    });
  }

  /**
   * Eliminar media por usuario
   * @param {number} userId 
   * @returns {PromiseObject}
   */
  async deleteByUser(userId) {
    return await this.supabase
      .from(this.tableName)
      .delete()
      .eq('user_id', userId)
      .select();
  }

  /**
   * Eliminar media por compañía
   * @param {number} companyId 
   * @returns {PromiseObject}
   */
  async deleteByCompany(companyId) {
    return await this.supabase
      .from(this.tableName)
      .delete()
      .eq('company_id', companyId)
      .select();
  }
}

export default MediaRepository;
