/**
 * @file supabaseClient.ts
 * @description Cliente Supabase avanzado con configuración enterprise-level,
 * monitoreo de rendimiento, manejo de errores robusto y retry automático.
 */

import { createClient, SupabaseClient, PostgrestError, AuthError } from '@supabase/supabase-js';
import retry from 'async-retry';
import { performance } from 'perf_hooks';
import { Mutex } from 'async-mutex';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/impulsa';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado exitosamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose desconectado de MongoDB');
});

// Manejo de señales de cierre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Tipos personalizados para extender funcionalidad
type MetricsData = {
  operationDuration: number;
  timestamp: Date;
  operation: string;
  success: boolean;
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface RetryOptions {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

// Interfaz para nuestra configuración extendida
interface EnhancedSupabaseConfig {
  metricsEnabled?: boolean;
  retryConfig?: RetryOptions;
  logLevel?: LogLevel;
  customHeaders?: Record<string, string>;
  timeoutMs?: number;
  regionConfig?: {
    region: string;
    dataCenter?: string;
  };
  accessTokenRefreshBuffer?: number; // en segundos
}

// Logger sofisticado con niveles y formateo
class SupabaseLogger {
  private readonly level: LogLevel;
  private readonly levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    return this.levels[messageLevel] >= this.levels[this.level];
  }

  debug(message: string, context?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[SUPABASE][DEBUG] ${message}`, context || '');
    }
  }

  info(message: string, context?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[SUPABASE][INFO] ${message}`, context || '');
    }
  }

  warn(message: string, context?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[SUPABASE][WARN] ${message}`, context || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[SUPABASE][ERROR] ${message}`, error || '');
    }
  }
}

// Clase para métricas de rendimiento
class PerformanceMetrics {
  private metrics: MetricsData[] = [];
  private readonly maxMetricsLength: number = 100;

  recordMetric(data: MetricsData): void {
    this.metrics.push(data);
    if (this.metrics.length > this.maxMetricsLength) {
      this.metrics.shift();
    }
  }

  getAverageOperationTime(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation && m.success) 
      : this.metrics.filter(m => m.success);
    
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, metric) => sum + metric.operationDuration, 0);
    return total / relevantMetrics.length;
  }

  getSuccessRate(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation) 
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const successCount = relevantMetrics.filter(m => m.success).length;
    return (successCount / relevantMetrics.length) * 100;
  }

  getMetricsSummary(): Record<string, any> {
    return {
      totalOperations: this.metrics.length,
      successRate: this.getSuccessRate(),
      averageOperationTime: this.getAverageOperationTime(),
      operationBreakdown: this.getOperationBreakdown()
    };
  }

  private getOperationBreakdown(): Record<string, any> {
    const operations = [...new Set(this.metrics.map(m => m.operation))];
    const breakdown: Record<string, any> = {};
    
    for (const op of operations) {
      breakdown[op] = {
        count: this.metrics.filter(m => m.operation === op).length,
        successRate: this.getSuccessRate(op),
        averageTime: this.getAverageOperationTime(op)
      };
    }
    
    return breakdown;
  }
}

/**
 * EnhancedSupabase - Cliente Supabase potenciado con características avanzadas
 * para aplicaciones enterprise-level.
 */
class EnhancedSupabase {
  private client: SupabaseClient;
  private metrics: PerformanceMetrics;
  private logger: SupabaseLogger;
  private config: EnhancedSupabaseConfig;
  private tokenRefreshMutex = new Mutex();
  private lastTokenRefresh: number = 0;
  
  constructor(
    supabaseUrl: string, 
    supabaseKey: string,
    config: EnhancedSupabaseConfig = {}
  ) {
    // Validación de configuración
    this.validateConfig(supabaseUrl, supabaseKey);
    
    // Configuración por defecto optimizada
    this.config = {
      metricsEnabled: true,
      logLevel: 'info',
      timeoutMs: 30000,
      accessTokenRefreshBuffer: 300, // 5 minutos
      retryConfig: {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 5000,
        factor: 2,
        onRetry: (error: Error, attempt: number) => {
          this.logger.warn(`Retry attempt ${attempt} due to: ${error.message}`);
        }
      },
      ...config
    };
    
    // Setup de servicios internos
    this.logger = new SupabaseLogger(this.config.logLevel);
    this.metrics = new PerformanceMetrics();
    
    // Opciones avanzadas para el cliente Supabase
    const supabaseOptions = {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'x-client-info': 'enhanced-supabase-client/1.0.0',
          ...this.config.customHeaders
        },
        fetch: this.createEnhancedFetch()
      }
    };
    
    // Inicializar cliente Supabase
    this.client = createClient(supabaseUrl, supabaseKey, supabaseOptions);
    
    this.logger.info('EnhancedSupabase initialized successfully', {
      url: supabaseUrl,
      metricsEnabled: this.config.metricsEnabled,
      retryEnabled: !!this.config.retryConfig
    });
  }
  
  /**
   * Crea un fetch personalizado con timeout y métricas
   */
  private createEnhancedFetch() {
    const originalFetch = global.fetch;
    
    return async (input: string | URL | Request, init?: RequestInit) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
      
      const enhancedInit = {
        ...init,
        signal: controller.signal
      };
      
      try {
        const response = await originalFetch(input, enhancedInit);
        return response;
      } catch (error) {
        this.logger.error('Fetch operation failed', error);
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    };
  }
  
  /**
   * Valida la configuración requerida
   */
  private validateConfig(url?: string, key?: string): void {
    if (!url || !key) {
      const error = new Error('Supabase URL and Service Role Key must be set');
      this.logger.error('Configuration validation failed', error);
      throw error;
    }
  }
  
  /**
   * Ejecuta una operación con medición de rendimiento y retry automático
   */
  private async executeWithMetrics<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let success = false;
    
    try {
      // Si hay configuración de retry, usarla
      let result: T;
      
      if (this.config.retryConfig) {
        result = await retry(async () => {
          return await fn();
        }, this.config.retryConfig);
      } else {
        result = await fn();
      }
      
      success = true;
      return result;
    } finally {
      const endTime = performance.now();
      
      if (this.config.metricsEnabled) {
        this.metrics.recordMetric({
          operationDuration: endTime - startTime,
          timestamp: new Date(),
          operation,
          success
        });
      }
    }
  }
  
  /**
   * Método público para obtener métricas de rendimiento
   */
  getPerformanceMetrics() {
    return this.metrics.getMetricsSummary();
  }
  
  /**
   * Método mejorado para consultas a tablas
   */
  async query<T = any>(tableName: string, queryFn: (query: any) => any): Promise<T[]> {
    return this.executeWithMetrics(`query:${tableName}`, async () => {
      const { data, error } = await queryFn(this.client.from(tableName));
      
      if (error) {
        this.handleError(error, `Query on ${tableName} failed`);
      }
      
      return data as T[];
    });
  }
  
  /**
   * Inserción optimizada con validación
   */
  async insert<T = any>(tableName: string, rows: any | any[]): Promise<T[]> {
    return this.executeWithMetrics(`insert:${tableName}`, async () => {
      const { data, error } = await this.client.from(tableName).insert(rows).select();
      
      if (error) {
        this.handleError(error, `Insert into ${tableName} failed`);
      }
      
      return data as T[];
    });
  }
  
  /**
   * Actualización con mejor manejo de errores
   */
  async update<T = any>(tableName: string, updates: any, match: any): Promise<T[]> {
    return this.executeWithMetrics(`update:${tableName}`, async () => {
      const { data, error } = await this.client
        .from(tableName)
        .update(updates)
        .match(match)
        .select();
      
      if (error) {
        this.handleError(error, `Update on ${tableName} failed`);
      }
      
      return data as T[];
    });
  }
  
  /**
   * Eliminación con confirmación
   */
  async delete(tableName: string, match: any): Promise<void> {
    return this.executeWithMetrics(`delete:${tableName}`, async () => {
      const { error } = await this.client
        .from(tableName)
        .delete()
        .match(match);
      
      if (error) {
        this.handleError(error, `Delete from ${tableName} failed`);
      }
    });
  }
  
  /**
   * Ejecución de función RPC
   */
  async rpc<T = any>(functionName: string, params?: any): Promise<T> {
    return this.executeWithMetrics(`rpc:${functionName}`, async () => {
      const { data, error } = await this.client.rpc(functionName, params);
      
      if (error) {
        this.handleError(error, `RPC function ${functionName} failed`);
      }
      
      return data as T;
    });
  }
  
  /**
   * Autenticación con refresh token optimizado
   */
  async signIn(email: string, password: string): Promise<any> {
    return this.executeWithMetrics('auth:signIn', async () => {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        this.handleError(error, 'Authentication failed');
      }
      
      this.lastTokenRefresh = Date.now();
      return data;
    });
  }
  
  /**
   * Refresh de token con mutex para evitar race conditions
   */
  async refreshSession(): Promise<void> {
    // Usar mutex para evitar múltiples refreshes simultáneos
    await this.tokenRefreshMutex.runExclusive(async () => {
      const now = Date.now();
      const refreshBuffer = this.config.accessTokenRefreshBuffer || 300; // 5 min por defecto
      
      // Evitar refreshes innecesarios si se hizo uno recientemente
      if (now - this.lastTokenRefresh < refreshBuffer * 1000) {
        return;
      }
      
      try {
        const { error } = await this.client.auth.refreshSession();
        if (error) {
          this.logger.error('Failed to refresh token', error);
        } else {
          this.lastTokenRefresh = now;
          this.logger.debug('Token refreshed successfully');
        }
      } catch (e) {
        this.logger.error('Token refresh threw an exception', e);
      }
    });
  }
  
  /**
   * Manejo sofisticado de errores
   */
  private handleError(error: PostgrestError | AuthError, context: string): never {
    this.logger.error(`${context}: ${error.message}`, {
      code: 'code' in error ? error.code : undefined,
      details: 'details' in error ? error.details : undefined,
      hint: 'hint' in error ? error.hint : undefined
    });
    
    // Transformar el error en algo más informativo
    const enhancedError = new Error(`${context}: ${error.message}`);
    if ('code' in error) (enhancedError as any).code = error.code;
    if ('details' in error) (enhancedError as any).details = error.details;
    (enhancedError as any).originalError = error;
    
    throw enhancedError;
  }
  
  /**
   * Acceso al cliente base para funcionalidades personalizadas
   */
  get baseClient(): SupabaseClient {
    return this.client;
  }
}

// Configuración desde variables de entorno con validación
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const environment = process.env.NODE_ENV || 'development';

// Configuración específica por entorno
const configByEnvironment: Record<string, EnhancedSupabaseConfig> = {
  production: {
    logLevel: 'warn',
    metricsEnabled: true,
    timeoutMs: 10000, // Menor timeout en producción
    retryConfig: {
      retries: 3,
      factor: 1.5,
      minTimeout: 500,
      maxTimeout: 3000
    }
  },
  staging: {
    logLevel: 'info',
    metricsEnabled: true,
    timeoutMs: 15000
  },
  development: {
    logLevel: 'debug',
    metricsEnabled: true,
    timeoutMs: 30000
  }
};

// Inicializar cliente con configuración optimizada por entorno
const supabase = new EnhancedSupabase(
  supabaseUrl, 
  supabaseKey, 
  configByEnvironment[environment] || {}
);

export type { EnhancedSupabase };
export default supabase;
