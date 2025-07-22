export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role_id: number;
  company_id?: number | null;
  is_active: boolean;
  is_superadmin: boolean;
  last_login?: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  deleted_by?: number | null;
  version: number;
  permissions?: Permission[];
  company?: Company;
  role_name?: string;
  role_description?: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role_id: number;
  company_id?: number;
  is_superadmin?: boolean;
  [key: string]: any;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  company_id?: number | null;
  is_active?: boolean;
  is_superadmin?: boolean;
  last_login?: Date | null;
  [key: string]: any;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}

interface Company {
  id: number;
  name: string;
  description?: string;
  admin_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}
