import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('Iniciando creación de tablas en Supabase...');
    console.log('URL:', supabaseUrl);

    // Crear tabla companies
    console.log('Creando tabla companies...');
    const { error: companiesError } = await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS companies (
        id bigint primary key generated always as identity,
        name text not null,
        address text,
        phone text,
        email text
      );`
    }).single();

    if (companiesError) {
      // Si la función rpc no existe, intentamos crear las tablas directamente
      console.log('La función RPC no existe, intentando método alternativo...');
      await createTablesAlternative();
      return;
    }

    // Crear tabla roles
    console.log('Creando tabla roles...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS roles (
        id bigint primary key generated always as identity,
        name text not null,
        description text
      );`
    });
    
    // Crear tabla permissions
    console.log('Creando tabla permissions...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS permissions (
        id bigint primary key generated always as identity,
        name text not null,
        description text
      );`
    });
    
    // Crear tabla users
    console.log('Creando tabla users...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS users (
        id bigint primary key generated always as identity,
        username text not null unique,
        password text not null,
        email text not null unique,
        role_id bigint references roles (id),
        company_id bigint references companies (id),
        is_superadmin boolean default false
      );`
    });
    
    // Crear tabla role_permissions
    console.log('Creando tabla role_permissions...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS role_permissions (
        role_id bigint references roles (id),
        permission_id bigint references permissions (id),
        primary key (role_id, permission_id)
      );`
    });
    
    // Crear tabla clients
    console.log('Creando tabla clients...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS clients (
        id bigint primary key generated always as identity,
        company_id bigint references companies (id),
        name text not null,
        email text,
        phone text
      );`
    });
    
    // Crear tabla social_networks
    console.log('Creando tabla social_networks...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS social_networks (
        id bigint primary key generated always as identity,
        client_id bigint references clients (id),
        platform text not null,
        metrics jsonb,
        connected_at timestamp with time zone default now()
      );`
    });
    
    // Crear tabla automations
    console.log('Creando tabla automations...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS automations (
        id bigint primary key generated always as identity,
        client_id bigint references clients (id),
        name text not null,
        description text,
        created_at timestamp with time zone default now()
      );`
    });
    
    // Crear tabla ai_services
    console.log('Creando tabla ai_services...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS ai_services (
        id bigint primary key generated always as identity,
        name text not null,
        api_key text not null
      );`
    });
    
    // Crear tabla teams
    console.log('Creando tabla teams...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS teams (
        id bigint primary key generated always as identity,
        name text not null,
        company_id bigint references companies (id),
        created_at timestamp with time zone default now()
      );`
    });
    
    // Crear tabla team_members
    console.log('Creando tabla team_members...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS team_members (
        team_id bigint references teams (id),
        user_id bigint references users (id),
        role text,
        primary key (team_id, user_id)
      );`
    });
    
    // Crear tabla notifications
    console.log('Creando tabla notifications...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS notifications (
        id bigint primary key generated always as identity,
        user_id bigint references users (id),
        message text not null,
        created_at timestamp with time zone default now(),
        is_read boolean default false
      );`
    });
    
    // Crear tabla leads
    console.log('Creando tabla leads...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS leads (
        id bigint primary key generated always as identity,
        client_id bigint references clients (id),
        social_network_id bigint references social_networks (id),
        status text not null,
        last_contacted_at timestamp with time zone,
        notes text
      );`
    });
    
    // Crear tabla activities
    console.log('Creando tabla activities...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS activities (
        id bigint primary key generated always as identity,
        user_id bigint references users (id),
        description text not null,
        created_at timestamp with time zone default now(),
        company_id bigint references companies (id),
        team_id bigint references teams (id)
      );`
    });
    
    // Crear tabla plans
    console.log('Creando tabla plans...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS plans (
        id bigint primary key generated always as identity,
        name text not null,
        description text,
        status text not null,
        created_by bigint references users (id),
        company_id bigint references companies (id),
        team_id bigint references teams (id),
        created_at timestamp with time zone default now()
      );`
    });
    
    // Crear tabla services
    console.log('Creando tabla services...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS services (
        id bigint primary key generated always as identity,
        name text not null,
        description text,
        price_per_month numeric not null
      );`
    });
    
    // Crear tabla client_services
    console.log('Creando tabla client_services...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS client_services (
        id bigint primary key generated always as identity,
        client_id bigint references clients (id),
        service_id bigint references services (id),
        start_date date not null,
        end_date date,
        is_active boolean default true
      );`
    });
    
    // Crear tabla company_services
    console.log('Creando tabla company_services...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TABLE IF NOT EXISTS company_services (
        id bigint primary key generated always as identity,
        company_id bigint references companies (id),
        service_id bigint references services (id),
        start_date date not null,
        end_date date,
        is_active boolean default true
      );`
    });
    
    // Crear función y trigger
    console.log('Creando función deactivate_client_services...');
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE OR REPLACE FUNCTION deactivate_client_services() RETURNS trigger AS $$
      BEGIN
          IF NEW.is_active = false THEN
              UPDATE client_services
              SET is_active = false
              WHERE client_id IN (
                  SELECT id FROM clients WHERE company_id = NEW.company_id
              ) AND service_id = NEW.service_id;
          END IF;
          RETURN NEW;
      END;
      $$ language plpgsql;`
    });
    
    console.log('Creando trigger deactivate_client_services_trigger...');
    await supabase.rpc('execute_sql', {
      sql_query: `DROP TRIGGER IF EXISTS deactivate_client_services_trigger ON company_services;`
    });
    
    await supabase.rpc('execute_sql', {
      sql_query: `CREATE TRIGGER deactivate_client_services_trigger
      AFTER UPDATE OF is_active ON company_services
      FOR EACH ROW
      EXECUTE FUNCTION deactivate_client_services();`
    });
    
    console.log('Todas las tablas han sido creadas correctamente.');
    console.log('Ahora puedes ejecutar el script de creación de usuario administrador.');
    process.exit(0);

  } catch (error) {
    console.error('Error al crear tablas:', error);
    console.log('Intentando método alternativo...');
    await createTablesAlternative();
  }
}

// Método alternativo usando el cliente REST de Supabase
async function createTablesAlternative() {
  try {
    console.log('Utilizando cliente SQL directo para crear las tablas...');
    
    // Primero, crear la función SQL que ejecutará los comandos DDL
    console.log('Creando función auxiliar en Supabase...');
    
    // Creamos la función SQL para ejecutar DDL
    const { data: funcData, error: funcError } = await supabase
      .from('_sql_queries')
      .insert({
        sql: `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT) RETURNS VOID AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });
    
    if (funcError) {
      console.log('Error al crear función auxiliar, usando método manual...');
      console.log('Para crear las tablas, debes ejecutar manualmente el SQL en el panel de SQL de Supabase.');
      console.log('Aquí está el SQL completo para copiar y pegar:');
      
      const allSQL = `
CREATE TABLE IF NOT EXISTS companies (
  id bigint primary key generated always as identity,
  name text not null,
  address text,
  phone text,
  email text
);

CREATE TABLE IF NOT EXISTS roles (
  id bigint primary key generated always as identity,
  name text not null,
  description text
);

CREATE TABLE IF NOT EXISTS permissions (
  id bigint primary key generated always as identity,
  name text not null,
  description text
);

CREATE TABLE IF NOT EXISTS users (
  id bigint primary key generated always as identity,
  username text not null unique,
  password text not null,
  email text not null unique,
  role_id bigint references roles (id),
  company_id bigint references companies (id),
  is_superadmin boolean default false
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id bigint references roles (id),
  permission_id bigint references permissions (id),
  primary key (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS clients (
  id bigint primary key generated always as identity,
  company_id bigint references companies (id),
  name text not null,
  email text,
  phone text
);

CREATE TABLE IF NOT EXISTS social_networks (
  id bigint primary key generated always as identity,
  client_id bigint references clients (id),
  platform text not null,
  metrics jsonb,
  connected_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS automations (
  id bigint primary key generated always as identity,
  client_id bigint references clients (id),
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS ai_services (
  id bigint primary key generated always as identity,
  name text not null,
  api_key text not null
);

CREATE TABLE IF NOT EXISTS teams (
  id bigint primary key generated always as identity,
  name text not null,
  company_id bigint references companies (id),
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id bigint references teams (id),
  user_id bigint references users (id),
  role text,
  primary key (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  message text not null,
  created_at timestamp with time zone default now(),
  is_read boolean default false
);

CREATE TABLE IF NOT EXISTS leads (
  id bigint primary key generated always as identity,
  client_id bigint references clients (id),
  social_network_id bigint references social_networks (id),
  status text not null,
  last_contacted_at timestamp with time zone,
  notes text
);

CREATE TABLE IF NOT EXISTS activities (
  id bigint primary key generated always as identity,
  user_id bigint references users (id),
  description text not null,
  created_at timestamp with time zone default now(),
  company_id bigint references companies (id),
  team_id bigint references teams (id)
);

CREATE TABLE IF NOT EXISTS plans (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  status text not null,
  created_by bigint references users (id),
  company_id bigint references companies (id),
  team_id bigint references teams (id),
  created_at timestamp with time zone default now()
);

CREATE TABLE IF NOT EXISTS services (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price_per_month numeric not null
);

CREATE TABLE IF NOT EXISTS client_services (
  id bigint primary key generated always as identity,
  client_id bigint references clients (id),
  service_id bigint references services (id),
  start_date date not null,
  end_date date,
  is_active boolean default true
);

CREATE TABLE IF NOT EXISTS company_services (
  id bigint primary key generated always as identity,
  company_id bigint references companies (id),
  service_id bigint references services (id),
  start_date date not null,
  end_date date,
  is_active boolean default true
);

CREATE OR REPLACE FUNCTION deactivate_client_services() RETURNS trigger AS $$
BEGIN
    IF NEW.is_active = false THEN
        UPDATE client_services
        SET is_active = false
        WHERE client_id IN (
            SELECT id FROM clients WHERE company_id = NEW.company_id
        ) AND service_id = NEW.service_id;
    END IF;
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS deactivate_client_services_trigger ON company_services;

CREATE TRIGGER deactivate_client_services_trigger
AFTER UPDATE OF is_active ON company_services
FOR EACH ROW
EXECUTE FUNCTION deactivate_client_services();
      `;
      
      console.log(allSQL);
      
      process.exit(1);
    } else {
      console.log('Función auxiliar creada, iniciando creación de tablas...');
      await createTables(); // Intentar nuevamente
    }
  } catch (error) {
    console.error('Error en método alternativo:', error);
    console.log('Por favor, crea las tablas manualmente utilizando el panel SQL de Supabase.');
    process.exit(1);
  }
}

// Ejecutar la función principal
createTables();