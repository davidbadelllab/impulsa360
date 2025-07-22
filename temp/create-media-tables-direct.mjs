import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createMediaTables() {
  try {
    console.log('Iniciando creación de tablas del sistema de archivos...');

    // Crear tabla folders (carpetas)
    console.log('Creando tabla folders...');
    const { error: foldersError } = await supabase
      .from('folders')
      .select('id')
      .limit(1);

    if (foldersError && foldersError.code === 'PGRST116') {
      // La tabla no existe, crearla usando SQL directo
      console.log('Tabla folders no existe, creando...');
      
      // Usar la API REST de Supabase para ejecutar SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          sql_query: `
            CREATE TABLE IF NOT EXISTS folders (
              id bigint primary key generated always as identity,
              name text not null,
              parent_id bigint references folders (id) on delete cascade,
              user_id bigint references users (id) on delete cascade,
              company_id bigint references companies (id) on delete cascade,
              created_at timestamp with time zone default now(),
              updated_at timestamp with time zone default now()
            );
          `
        })
      });

      if (!response.ok) {
        console.log('Función execute_sql no disponible, usando método alternativo...');
        
        // Método alternativo: usar el cliente de Supabase directamente
        const { data, error } = await supabase
          .rpc('create_folders_table', {});
        
        if (error) {
          console.log('Creando tablas manualmente en el dashboard de Supabase...');
          console.log(`
            Por favor, ejecuta estas consultas SQL en el dashboard de Supabase:
            
            -- Crear tabla folders
            CREATE TABLE IF NOT EXISTS folders (
              id bigint primary key generated always as identity,
              name text not null,
              parent_id bigint references folders (id) on delete cascade,
              user_id bigint references users (id) on delete cascade,
              company_id bigint references companies (id) on delete cascade,
              created_at timestamp with time zone default now(),
              updated_at timestamp with time zone default now()
            );
            
            -- Crear tabla files
            CREATE TABLE IF NOT EXISTS files (
              id bigint primary key generated always as identity,
              name text not null,
              original_name text not null,
              file_path text not null,
              file_size bigint not null,
              mime_type text not null,
              folder_id bigint references folders (id) on delete cascade,
              user_id bigint references users (id) on delete cascade,
              company_id bigint references companies (id) on delete cascade,
              created_at timestamp with time zone default now(),
              updated_at timestamp with time zone default now()
            );
            
            -- Crear tabla file_shares
            CREATE TABLE IF NOT EXISTS file_shares (
              id bigint primary key generated always as identity,
              file_id bigint references files (id) on delete cascade,
              shared_by bigint references users (id) on delete cascade,
              shared_with bigint references users (id) on delete cascade,
              permission_type text not null check (permission_type in ('read', 'write', 'admin')),
              created_at timestamp with time zone default now(),
              unique(file_id, shared_with)
            );
            
            -- Crear tabla folder_shares
            CREATE TABLE IF NOT EXISTS folder_shares (
              id bigint primary key generated always as identity,
              folder_id bigint references folders (id) on delete cascade,
              shared_by bigint references users (id) on delete cascade,
              shared_with bigint references users (id) on delete cascade,
              permission_type text not null check (permission_type in ('read', 'write', 'admin')),
              created_at timestamp with time zone default now(),
              unique(folder_id, shared_with)
            );
            
            -- Crear índices
            CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders (user_id);
            CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders (parent_id);
            CREATE INDEX IF NOT EXISTS idx_files_user_id ON files (user_id);
            CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files (folder_id);
            CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares (file_id);
            CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares (shared_with);
            CREATE INDEX IF NOT EXISTS idx_folder_shares_folder_id ON folder_shares (folder_id);
            CREATE INDEX IF NOT EXISTS idx_folder_shares_shared_with ON folder_shares (shared_with);
            
            -- Crear función para updated_at
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = now();
              RETURN NEW;
            END;
            $$ language 'plpgsql';
            
            -- Crear triggers
            CREATE TRIGGER update_folders_updated_at 
              BEFORE UPDATE ON folders 
              FOR EACH ROW 
              EXECUTE FUNCTION update_updated_at_column();
            
            CREATE TRIGGER update_files_updated_at 
              BEFORE UPDATE ON files 
              FOR EACH ROW 
              EXECUTE FUNCTION update_updated_at_column();
          `);
          
          console.log('✅ Instrucciones SQL generadas. Ejecuta estas consultas en el dashboard de Supabase.');
          return;
        }
      }
    }

    console.log('✅ Verificando tablas existentes...');
    
    // Verificar si las tablas existen
    const tables = ['folders', 'files', 'file_shares', 'folder_shares'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabla ${table} no encontrada:`, error.message);
      } else {
        console.log(`✅ Tabla ${table} existe`);
      }
    }

  } catch (error) {
    console.error('❌ Error creando tablas del sistema de archivos:', error);
  }
}

// Ejecutar la migración
createMediaTables(); 