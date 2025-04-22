import type { Pool } from 'pg';
import type { EnhancedSupabase } from '../lib/db';
import pool from '../lib/db';
import logger from '../utils/logger';
import { cacheManager } from '../services/cacheManager';

interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

interface CreateCompanyDTO {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface UpdateCompanyDTO {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export class CompanyRepository {
  private readonly CACHE_TTL = 60 * 5; // 5 minutos
  private readonly CACHE_PREFIX = 'company:';

  constructor(private readonly pool: EnhancedSupabase) {}

  async findAll(options: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filters?: Record<string, any>;
  }): Promise<{ data: Company[]; total: number }> {
    const { page = 1, limit = 20, sort = 'name', order = 'asc', search, filters } = options;
    const offset = (page - 1) * limit;

    try {
      let query = this.pool.baseClient
        .from('companies')
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order(sort, { ascending: order === 'asc' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          query = query.eq(key, value);
        }
      }

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      logger.error('Error finding companies', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Company | null> {
    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    const cachedCompany = await cacheManager.get(cacheKey) as Company | null;

    if (cachedCompany) {
      return cachedCompany;
    }

    const { data, error } = await this.pool.baseClient
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    await cacheManager.set(cacheKey, data, this.CACHE_TTL);
    return data;
  }

  async create(companyData: CreateCompanyDTO): Promise<Company> {
    const { data, error } = await this.pool.baseClient
      .from('companies')
      .insert(companyData)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create company');
    }

    await cacheManager.del(`${this.CACHE_PREFIX}all:`);
    return data;
  }

  async update(id: number, companyData: UpdateCompanyDTO): Promise<Company> {
    const { data, error } = await this.pool.baseClient
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Company not found');
    }

    const cacheKey = `${this.CACHE_PREFIX}${id}`;
    await cacheManager.set(cacheKey, data, this.CACHE_TTL);
    await cacheManager.del(`${this.CACHE_PREFIX}all:`);

    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.pool.baseClient
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    await cacheManager.del(`${this.CACHE_PREFIX}${id}`);
    await cacheManager.del(`${this.CACHE_PREFIX}all:`);
  }
}

export default new CompanyRepository(pool);
