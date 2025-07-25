import { Pool, QueryResult } from 'pg';
import { User, CreateUserDTO, UpdateUserDTO } from '../types/User';
import logger from '../utils/logger';
import { DatabaseError } from '../errors';

interface FindAllOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

interface FindByIdOptions {
  includeRole?: boolean;
  includePermissions?: boolean;
  includeCompany?: boolean;
}

interface DeleteOptions {
  hardDelete?: boolean;
  deleted_by?: number | null;
  deleted_at?: Date;
}

interface UpdateOptions {
  version?: number;
}

export class UserRepository {
  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE email = $1 OR username = $2
      LIMIT 1
    `;
    const { rows } = await this.pool.query(query, [email, username]);
    return rows[0] || null;
  }

  private pool: Pool;
  private table = 'users';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(options: FindAllOptions = {}): Promise<{ data: User[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      search = '',
      filters = {}
    } = options;

    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM ${this.table} WHERE deleted_at IS NULL`;
    let countQuery = `SELECT COUNT(*) FROM ${this.table} WHERE deleted_at IS NULL`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      countQuery += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query += ` AND ${key} = $${paramIndex}`;
        countQuery += ` AND ${key} = $${paramIndex}`;
        queryParams.push(value);
        paramIndex++;
      }
    });

    query += ` ORDER BY ${sort} ${order.toUpperCase()} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    try {
      const result: QueryResult<User> = await this.pool.query(query, queryParams);
      const countResult = await this.pool.query(countQuery, queryParams.slice(0, paramIndex - 1));
      const total = parseInt(countResult.rows[0].count, 10);

      return {
        data: result.rows,
        total
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error('Error en UserRepository.findAll:', error);
      }
      throw new DatabaseError('Error al obtener usuarios');
    }
  }

  async findById(id: number, options: FindByIdOptions = {}): Promise<User | null> {
    const { includeRole = false, includePermissions = false, includeCompany = false } = options;

    try {
      let query = `SELECT u.* FROM ${this.table} u WHERE u.id = $1 AND u.deleted_at IS NULL`;
      
      if (includeRole) {
        query = `
          SELECT u.*, r.name as role_name, r.description as role_description 
          FROM ${this.table} u 
          LEFT JOIN roles r ON u.role_id = r.id 
          WHERE u.id = $1 AND u.deleted_at IS NULL
        `;
      }

      const result: QueryResult<User> = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];

      if (includePermissions) {
        const permissionsQuery = `
          SELECT p.* FROM permissions p
          JOIN role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id = $1
        `;
        const permissionsResult = await this.pool.query(permissionsQuery, [user.role_id]);
        user.permissions = permissionsResult.rows;
      }

      if (includeCompany && user.company_id) {
        const companyQuery = `SELECT * FROM companies WHERE id = $1`;
        const companyResult = await this.pool.query(companyQuery, [user.company_id]);
        if (companyResult.rows.length > 0) {
          user.company = companyResult.rows[0];
        }
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.findById(${id}):`, error);
      }
      throw new DatabaseError(`Error al obtener usuario con ID ${id}`);
    }
  }

  async create(userData: CreateUserDTO): Promise<User> {
    const { password, username, email, role_id, company_id, is_superadmin, ...extraData } = userData;
    
    try {
      const columns = ['username', 'password', 'email', 'role_id', 'company_id', 'is_superadmin'];
      const values = [username, password, email, role_id, company_id, is_superadmin || false];
      const placeholders = ['$1', '$2', '$3', '$4', '$5', '$6'];
      
      let paramIndex = 7;
      Object.entries(extraData).forEach(([key, value]) => {
        if (value !== undefined) {
          columns.push(key);
          values.push(value);
          placeholders.push(`$${paramIndex}`);
          paramIndex++;
        }
      });
      
      const query = `
        INSERT INTO ${this.table} (${columns.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;
      
      const result: QueryResult<User> = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error('Error en UserRepository.create:', error);
      }
      
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        throw new DatabaseError('El nombre de usuario o correo electrónico ya está en uso');
      }
      
      throw new DatabaseError('Error al crear usuario');
    }
  }

  async update(id: number, updateData: Partial<UpdateUserDTO>, options: UpdateOptions = {}): Promise<User | null> {
    const { version } = options;
    
    try {
      const client = await this.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        let currentUser;
        if (version !== undefined) {
          const versionCheck = await client.query(
            `SELECT * FROM ${this.table} WHERE id = $1 AND version = $2 AND deleted_at IS NULL`,
            [id, version]
          );
          
          if (versionCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
          }
          
          currentUser = versionCheck.rows[0];
        } else {
          const userCheck = await client.query(
            `SELECT * FROM ${this.table} WHERE id = $1 AND deleted_at IS NULL`,
            [id]
          );
          
          if (userCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
          }
          
          currentUser = userCheck.rows[0];
        }
        
        const updateEntries = Object.entries(updateData).filter(
          ([_, value]) => value !== undefined
        );
        
        if (updateEntries.length === 0) {
          await client.query('ROLLBACK');
          return currentUser;
        }
        
        const setClause = updateEntries
          .map(([key], index) => `${key} = $${index + 1}`)
          .join(', ');
        
        const values = updateEntries.map(([_, value]) => value);
        values.push(id);
        
        const newVersion = (currentUser.version || 0) + 1;
        
        const query = `
          UPDATE ${this.table}
          SET ${setClause}, version = ${newVersion}, updated_at = NOW()
          WHERE id = $${values.length}
          RETURNING *
        `;
        
        const result = await client.query(query, values);
        await client.query('COMMIT');
        
        return result.rows[0];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.update(${id}):`, error);
      }
      throw new DatabaseError(`Error al actualizar usuario con ID ${id}`);
    }
  }

  async delete(id: number, options: DeleteOptions = {}): Promise<boolean> {
    const { hardDelete = false, deleted_by = null, deleted_at = new Date() } = options;
    
    try {
      logger.info(`Intentando eliminar usuario ${id}, hardDelete: ${hardDelete}`);
      
      let query;
      let params;
      
      if (hardDelete) {
        query = `DELETE FROM ${this.table} WHERE id = $1 RETURNING id`;
        params = [id];
        logger.info(`Ejecutando eliminación física para usuario ${id}`);
      } else {
        // Solo soft delete con deleted_at y deleted_by, removiendo is_active
        query = `
          UPDATE ${this.table}
          SET deleted_at = $1, deleted_by = $2, updated_at = NOW()
          WHERE id = $3 AND deleted_at IS NULL
          RETURNING id
        `;
        params = [deleted_at, deleted_by, id];
        logger.info(`Ejecutando soft delete para usuario ${id}`);
      }
      
      logger.info(`Query a ejecutar: ${query}`);
      logger.info(`Parámetros: ${JSON.stringify(params)}`);
      
      const result = await this.pool.query(query, params);
      const success = result.rows.length > 0;
      
      logger.info(`Resultado de eliminación para usuario ${id}: ${success ? 'exitoso' : 'no encontrado'}`);
      return success;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.delete(${id}):`, {
          message: error.message,
          stack: error.stack,
          name: error.name,
          // @ts-ignore - Acceder a propiedades específicas de error de base de datos
          code: error.code,
          detail: error.detail,
          hint: error.hint
        });
      }
      throw new DatabaseError(`Error al eliminar usuario con ID ${id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async checkCriticalDependencies(id: number): Promise<boolean> {
    try {
      const projectsQuery = `
        SELECT COUNT(*) FROM projects 
        WHERE created_by = $1 AND status != 'CLOSED'
      `;
      const projectsResult = await this.pool.query(projectsQuery, [id]);
      
      if (parseInt(projectsResult.rows[0].count, 10) > 0) {
        return true;
      }
      
      const adminQuery = `
        SELECT COUNT(*) FROM ${this.table} u 
        JOIN companies c ON u.company_id = c.id 
        WHERE c.admin_id = $1 AND (
          SELECT COUNT(*) FROM ${this.table} 
          WHERE company_id = c.id AND role_id = 1 AND id != $1 AND deleted_at IS NULL
        ) = 0
      `;
      const adminResult = await this.pool.query(adminQuery, [id]);
      
      return parseInt(adminResult.rows[0].count, 10) > 0;
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.checkCriticalDependencies(${id}):`, error);
      }
      throw new DatabaseError(`Error al verificar dependencias del usuario con ID ${id}`);
    }
  }

  async batchUpdate(userIds: number[], data: Partial<UpdateUserDTO>): Promise<{ affected: number; data: User[] }> {
    try {
      const updateEntries = Object.entries(data).filter(
        ([_, value]) => value !== undefined
      );
      
      if (updateEntries.length === 0 || userIds.length === 0) {
        return { affected: 0, data: [] };
      }
      
      const setClause = updateEntries
        .map(([key], index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const values = updateEntries.map(([_, value]) => value);
      values.push(userIds);
      
      const query = `
        UPDATE ${this.table}
        SET ${setClause}, updated_at = NOW()
        WHERE id = ANY($${values.length})
        AND deleted_at IS NULL
        RETURNING *
      `;
      
      const result = await this.pool.query(query, values);
      
      return {
        affected: result.rowCount || 0,
        data: result.rows
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.batchUpdate:`, error);
      }
      throw new DatabaseError(`Error al actualizar usuarios en lote`);
    }
  }

  async batchDelete(userIds: number[]): Promise<{ affected: number; data: any[] }> {
    try {
      const query = `
        UPDATE ${this.table}
        SET deleted_at = NOW(), is_active = false
        WHERE id = ANY($1)
        AND deleted_at IS NULL
        RETURNING id
      `;
      
      const result = await this.pool.query(query, [userIds]);
      
      return {
        affected: result.rowCount || 0,
        data: result.rows
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.batchDelete:`, error);
      }
      throw new DatabaseError(`Error al eliminar usuarios en lote`);
    }
  }

  async batchActivate(userIds: number[]): Promise<{ affected: number; data: any[] }> {
    try {
      const query = `
        UPDATE ${this.table}
        SET is_active = true, updated_at = NOW()
        WHERE id = ANY($1)
        AND deleted_at IS NULL
        RETURNING id, username, email, is_active
      `;
      
      const result = await this.pool.query(query, [userIds]);
      
      return {
        affected: result.rowCount || 0,
        data: result.rows
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.batchActivate:`, error);
      }
      throw new DatabaseError(`Error al activar usuarios en lote`);
    }
  }

  async batchDeactivate(userIds: number[]): Promise<{ affected: number; data: any[] }> {
    try {
      const query = `
        UPDATE ${this.table}
        SET is_active = false, updated_at = NOW()
        WHERE id = ANY($1)
        AND deleted_at IS NULL
        RETURNING id, username, email, is_active
      `;
      
      const result = await this.pool.query(query, [userIds]);
      
      return {
        affected: result.rowCount || 0,
        data: result.rows
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error en UserRepository.batchDeactivate:`, error);
      }
      throw new DatabaseError(`Error al desactivar usuarios en lote`);
    }
  }
}
