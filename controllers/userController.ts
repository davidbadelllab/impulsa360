import { Request, Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import logger from '../src/utils/logger.js';
import { UserRepository } from '../src/repositories/UserRepository.js';
import type { ApiResponse } from '../src/types/ApiResponse.js';
import type { User, CreateUserDTO, UpdateUserDTO } from '../src/types/User.js';
import { asyncHandler } from '../src/middleware/asyncHandler.js';
import { hashPassword } from '../src/utils/auth.js';
import { NotFoundError } from '../src/errors/index.js';
import { BadRequestError } from '../src/errors/index.js';
import { ValidationError } from '../src/errors/index.js';
import { DatabaseError } from '../src/errors/index.js';
import { ConflictError } from '../src/errors/index.js';
import { ForbiddenError } from '../src/errors/index.js';
import { performance } from 'perf_hooks';
import validate from '../src/utils/validate.js';
import { userSchema } from '../src/schemas/userSchema.js';
import { cacheManager } from '../src/services/cacheManager.js';

/**
 * @class UserController
 * @description Controlador avanzado para gestión de usuarios con características enterprise-ready
 */
interface UserControllerConfig {
  cacheTTL?: number;
  cachePrefix?: string;
}

class UserController {
  private readonly repository: UserRepository;
  private readonly CACHE_TTL: number;
  private readonly CACHE_PREFIX: string;

  constructor(supabase: SupabaseClient, config: UserControllerConfig = {}) {
    this.repository = new UserRepository(supabase);
    this.CACHE_TTL = config.cacheTTL || 60 * 5; // 5 minutos por defecto
    this.CACHE_PREFIX = config.cachePrefix || 'user:';
  }

  /**
   * @route GET /api/v1/users
   * @description Obtiene todos los usuarios con paginación, filtrado y búsqueda
   */
  public getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const startTime = performance.now();
    
    // Extracción avanzada de parámetros de consulta
    const { 
      page = 1, 
      limit = 20, 
      sort = 'created_at', 
      order = 'desc',
      search = '',
      role,
      company,
      active
    } = req.query as Record<string, any>;
    
    // Clave de caché basada en todos los parámetros relevantes
    const cacheKey = `${this.CACHE_PREFIX}all:${page}:${limit}:${sort}:${order}:${search}:${role}:${company}:${active}`;
    
    // Intentar recuperar de caché primero
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${cacheKey}`);
      res.setHeader('X-Cache', 'HIT');
      res.json(cachedData);
      return;
    }
    
    // Construir opciones de filtrado dinámicamente
    const filters: Record<string, any> = {};
    if (role) filters.role_id = role;
    if (company) filters.company_id = company;
    if (active !== undefined) filters.is_active = active === 'true';
    
    // Ejecutar la consulta con todas las opciones
    const result = await this.repository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      order,
      search,
      filters
    });
    
    // Métricas de rendimiento
    const duration = performance.now() - startTime;
    
    // Construir respuesta optimizada
    const response: ApiResponse<User[]> = {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        pages: Math.ceil(result.total / parseInt(limit)),
        current: parseInt(page),
        limit: parseInt(limit)
      },
      meta: {
        executionTime: `${duration.toFixed(2)}ms`
      }
    };
    
    // Guardar en caché para futuras solicitudes
    await cacheManager.set(cacheKey, response, this.CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Execution-Time', `${duration.toFixed(2)}ms`);
    
    res.json(response);
  });

  /**
   * @route GET /api/v1/users/:id
   * @description Obtiene un usuario específico con datos relacionados
   */
  public getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError('ID de usuario inválido');
    }
    
    // Comprobar caché primero
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cachedUser = await cacheManager.get(cacheKey);
    
    if (cachedUser) {
      res.setHeader('X-Cache', 'HIT');
      res.json({
        success: true,
        data: cachedUser
      });
      return;
    }
    
    // Obtener usuario con relaciones (roles, permisos, etc.)
    const user = await this.repository.findById(Number(id), {
      includeRole: true,
      includePermissions: true,
      includeCompany: true
    });
    
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Almacenar en caché
    await cacheManager.set(cacheKey, user, this.CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');
    
    res.json({
      success: true,
      data: user
    });
  });

  /**
   * @route POST /api/v1/users
   * @description Crea un nuevo usuario con validación avanzada y seguridad
   * @param {CreateUserDTO} req.body - Datos del usuario a crear
   * @returns {ApiResponse} Respuesta con el usuario creado
   * @throws {ValidationError} Si los datos no son válidos
   * @throws {ConflictError} Si el email o username ya existen
   * @throws {DatabaseError} Si hay un error en la base de datos
   */
  public createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      // Validar datos de entrada
      const userData: CreateUserDTO = req.body;
      await validate(userSchema.create, userData);

      // Verificar unicidad de email y username
      const existingUser = await this.repository.findByEmailOrUsername(
        userData.email, 
        userData.username
      );
      
      if (existingUser) {
        throw new ConflictError(
          existingUser.email === userData.email 
            ? 'El email ya está en uso' 
            : 'El nombre de usuario ya está en uso'
        );
      }
    
      // Seguridad: hash de contraseña antes de almacenar
      const hashedPassword = await hashPassword(userData.password);
      
      // Auditoría básica
      const auditInfo = {
        created_by: req.user?.id || null,
        created_at: new Date(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      };
      
      // Crear usuario con datos enriquecidos
      const newUser = await this.repository.create({
        ...userData,
        password: hashedPassword,
        ...auditInfo
      });
      
      // Invalidar caché para mantener consistencia
      await cacheManager.del(`${this.CACHE_PREFIX}all:`);
      
      // Emitir evento para webhooks o integraciones
      // eventEmitter.emit('user.created', newUser);
      
      logger.info(`Usuario creado: ID ${newUser.id}`);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role_id: newUser.role_id,
          company_id: newUser.company_id,
          created_at: newUser.created_at
        }
      });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw new ValidationError(error.errors);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  });

  /**
   * @route PUT /api/v1/users/:id
   * @description Actualiza un usuario con validación y control de concurrencia
   * @param {string} req.params.id - ID del usuario a actualizar
   * @param {UpdateUserDTO} req.body - Datos a actualizar
   * @returns {ApiResponse} Respuesta con el usuario actualizado
   * @throws {ValidationError} Si los datos no son válidos
   * @throws {NotFoundError} Si el usuario no existe
   * @throws {ConflictError} Si hay conflicto de versión
   */
  public updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: UpdateUserDTO = req.body;
    
    // Validar ID
    if (!id || isNaN(Number(id))) {
      throw new BadRequestError('ID de usuario inválido');
    }
    
    // Validar datos
    try {
      await validate(userSchema.update, updateData);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw new ValidationError(error.errors);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
    
    // Control de concurrencia optimista con version
    const { version } = req.body;
    
    // Seguridad: si se actualiza contraseña, hashearla
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    // Información de auditoría
    const auditInfo = {
      updated_by: req.user?.id || null,
      updated_at: new Date(),
      ip_address: req.ip
    };
    
    // Actualizar con transaction para garantizar atomicidad
    const updatedUser = await this.repository.update(
      Number(id), 
      { ...updateData, ...auditInfo },
      { version }
    );
    
    if (!updatedUser) {
      throw new NotFoundError('Usuario no encontrado o ha sido modificado por otro usuario');
    }
    
    // Invalidar caché específica y general
    await Promise.all([
      cacheManager.del(`${this.CACHE_PREFIX}${id}`),
      cacheManager.del(`${this.CACHE_PREFIX}all:`)
    ]);
    
    logger.info(`Usuario actualizado: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role_id: updatedUser.role_id,
        company_id: updatedUser.company_id,
        updated_at: updatedUser.updated_at,
        version: updatedUser.version
      }
    });
  });

  /**
   * @route DELETE /api/v1/users/:id
   * @description Elimina un usuario (soft delete) con verificaciones de seguridad
   * @param {string} req.params.id - ID del usuario a eliminar
   * @param {boolean} [req.query.hardDelete=false] - Si es true, elimina permanentemente
   * @returns {ApiResponse} Respuesta de éxito
   * @throws {BadRequestError} Si no tiene permisos para hard delete
   * @throws {NotFoundError} Si el usuario no existe
   * @throws {ForbiddenError} Si el usuario intenta eliminarse a sí mismo
   */
  public deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { hardDelete = false } = req.query as Record<string, any>;
    
    // Verificar si el usuario intenta eliminarse a sí mismo
    if (req.user?.id === Number(id)) {
      throw new ForbiddenError('No puede eliminarse a sí mismo');
    }
    
    // Verificar si el usuario tiene privilegios para hard delete
    if (hardDelete && (!req.user?.is_superadmin)) {
      throw new BadRequestError('No tiene permisos para eliminar permanentemente usuarios');
    }
    
    // Por defecto, realizamos soft delete
    const options = {
      hardDelete: hardDelete === 'true' && req.user?.is_superadmin === true,
      deleted_by: req.user?.id,
      deleted_at: new Date()
    };
    
    // Verificar si hay dependencias críticas antes de eliminar
    const hasCriticalDependencies = await this.repository.checkCriticalDependencies(Number(id));
    if (hasCriticalDependencies && options.hardDelete) {
      throw new BadRequestError('No se puede eliminar el usuario porque tiene dependencias críticas');
    }
    
    const result = await this.repository.delete(Number(id), options);
    
    if (!result) {
      throw new NotFoundError('Usuario no encontrado');
    }
    
    // Limpiar todas las cachés relacionadas
    await Promise.all([
      cacheManager.del(`${this.CACHE_PREFIX}${id}`),
      cacheManager.del(`${this.CACHE_PREFIX}all:`)
    ]);
    
    logger.info(`Usuario ${options.hardDelete ? 'eliminado permanentemente' : 'desactivado'}: ID ${id}`);
    
    res.json({
      success: true,
      message: options.hardDelete 
        ? 'Usuario eliminado permanentemente'
        : 'Usuario desactivado exitosamente'
    });
  });
  
  /**
   * @route POST /api/v1/users/batch
   * @description Operaciones por lotes para usuarios (Enterprise feature)
   */
  public batchOperations = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { operation, userIds, data } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError('Se requiere al menos un ID de usuario');
    }
    
    let result;
    
    switch (operation) {
      case 'update':
        result = await this.repository.batchUpdate(userIds, data);
        break;
      case 'delete':
        result = await this.repository.batchDelete(userIds);
        break;
      case 'activate':
        result = await this.repository.batchActivate(userIds);
        break;
      case 'deactivate':
        result = await this.repository.batchDeactivate(userIds);
        break;
      default:
        throw new BadRequestError('Operación no soportada');
    }
    
    // Invalidar múltiples claves de caché
    await cacheManager.del(`${this.CACHE_PREFIX}all:`);
    for (const id of userIds) {
      await cacheManager.del(`${this.CACHE_PREFIX}${id}`);
    }
    
    res.json({
      success: true,
      message: `Operación ${operation} completada exitosamente`,
      affected: result.affected,
      data: result.data
    });
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables');
}

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

export default new UserController(supabase);
