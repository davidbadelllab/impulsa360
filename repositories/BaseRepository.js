import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.supabase = supabase;
  }

  /**
   * Obtener todos los registros
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>}
   */
  async findAll(options = {}) {
    try {
      const { 
        select = '*', 
        filters = {}, 
        orderBy = null, 
        limit = null,
        offset = null 
      } = options;

      let query = this.supabase
        .from(this.tableName)
        .select(select);

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else if (typeof value === 'object' && value.operator) {
          // Filtros avanzados: { field: { operator: 'gte', value: 10 } }
          query = query[value.operator](key, value.value);
        } else {
          query = query.eq(key, value);
        }
      });

      // Aplicar ordenamiento
      if (orderBy) {
        if (typeof orderBy === 'string') {
          query = query.order(orderBy);
        } else {
          query = query.order(orderBy.column, { ascending: orderBy.ascending !== false });
        }
      }

      // Aplicar límite y offset
      if (limit) query = query.limit(limit);
      if (offset) query = query.range(offset, offset + (limit || 1000) - 1);

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data,
        count: data?.length || 0
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.findAll:`, error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Obtener un registro por ID
   * @param {string|number} id 
   * @param {string} select - Campos a seleccionar
   * @returns {Promise<Object>}
   */
  async findById(id, select = '*') {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(select)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.findById:`, error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Crear un nuevo registro
   * @param {Object} data - Datos del registro
   * @returns {Promise<Object>}
   */
  async create(data) {
    try {
      // Añadir timestamps automáticamente si no existen
      const now = new Date().toISOString();
      const recordData = {
        ...data,
        created_at: data.created_at || now,
        updated_at: data.updated_at || now
      };

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .insert([recordData])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: result,
        message: `${this.tableName} creado exitosamente`
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.create:`, error);
      return {
        success: false,
        error: error.message,
        message: `Error creando ${this.tableName}`
      };
    }
  }

  /**
   * Actualizar un registro por ID
   * @param {string|number} id 
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    try {
      // Añadir timestamp de actualización
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: result,
        message: `${this.tableName} actualizado exitosamente`
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.update:`, error);
      return {
        success: false,
        error: error.message,
        message: `Error actualizando ${this.tableName}`
      };
    }
  }

  /**
   * Eliminar un registro por ID
   * @param {string|number} id 
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data,
        message: `${this.tableName} eliminado exitosamente`
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.delete:`, error);
      return {
        success: false,
        error: error.message,
        message: `Error eliminando ${this.tableName}`
      };
    }
  }

  /**
   * Buscar registros con condiciones personalizadas
   * @param {Object} conditions - Condiciones de búsqueda
   * @param {string} select - Campos a seleccionar
   * @returns {Promise<Object>}
   */
  async findWhere(conditions, select = '*') {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(select);

      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.findWhere:`, error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  /**
   * Contar registros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>}
   */
  async count(filters = {}) {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { count, error } = await query;

      if (error) throw error;

      return {
        success: true,
        count
      };
    } catch (error) {
      console.error(`Error en ${this.tableName}.count:`, error);
      return {
        success: false,
        error: error.message,
        count: 0
      };
    }
  }
}

export default BaseRepository;
