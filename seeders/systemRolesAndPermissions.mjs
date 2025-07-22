// IMPORTANTE: Deshabilitar verificación de SSL antes de cualquier importación
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Seeder para roles del sistema, permisos y organización inicial
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const { Pool } = pg;

// Construir URL modificada para deshabilitar SSL explícitamente
let connectionString = process.env.POSTGRES_URL;

// Si la URL no contiene sslmode=disable, añadirlo
if (connectionString && !connectionString.includes('sslmode=disable')) {
  connectionString += connectionString.includes('?') 
    ? '&sslmode=disable' 
    : '?sslmode=disable';
  console.log(`✅ URL de conexión modificada: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
}

// Configuración de conexión
const pool = new Pool({
  connectionString
});

// Log a archivo y consola
const logToFile = (message) => {
  const logFile = path.join(__dirname, 'seed-log.txt');
  fs.appendFileSync(logFile, `${new Date().toISOString()}: ${message}\n`);
  console.log(message);
};

async function seed() {
  let client;
  
  logToFile('Iniciando proceso de seed...');
  logToFile(`Entorno: ${process.env.NODE_ENV || 'no especificado'}`);
  
  try {
    logToFile('Intentando conectar a la base de datos...');
    client = await pool.connect();
    logToFile('✅ Conexión establecida con éxito');
    
    // Verificar conexión con consulta simple
    const testResult = await client.query('SELECT NOW() as now');
    logToFile(`🕒 Hora del servidor: ${testResult.rows[0].now}`);
    
    await client.query('BEGIN');

    // 1. Crear permisos básicos
    logToFile('Creando permisos básicos...');
    await client.query(`
      INSERT INTO permissions (name, description) VALUES
      ('users.create', 'Crear usuarios'),
      ('users.read', 'Ver usuarios'),
      ('users.update', 'Actualizar usuarios'),
      ('users.delete', 'Eliminar usuarios'),
      ('clients.create', 'Crear clientes'),
      ('clients.read', 'Ver clientes'),
      ('clients.update', 'Actualizar clientes'),
      ('clients.delete', 'Eliminar clientes'),
      ('reports.view', 'Ver reportes'),
      ('settings.manage', 'Gestionar configuraciones')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Crear roles del sistema
    logToFile('Creando roles del sistema...');
    await client.query(`
      INSERT INTO roles (name, description) VALUES
      ('superadmin', 'Administrador del sistema con todos los permisos'),
      ('admin', 'Administrador de compañía'),
      ('manager', 'Gerente de equipo'),
      ('agent', 'Agente estándar')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Asignar permisos a roles
    logToFile('Asignando permisos a roles...');
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'superadmin'
      ON CONFLICT DO NOTHING;

      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' AND p.name NOT LIKE 'settings.%'
      ON CONFLICT DO NOTHING;

      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'manager' AND (
        p.name LIKE 'clients.%' OR 
        p.name LIKE 'users.read' OR
        p.name LIKE 'reports.%'
      )
      ON CONFLICT DO NOTHING;

      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'agent' AND (
        p.name LIKE 'clients.read' OR
        p.name LIKE 'clients.update'
      )
      ON CONFLICT DO NOTHING;
    `);

    // 4. Crear compañía matriz Impulsa360
    // Primero verificamos si existe la compañía
    logToFile('Verificando si existe la compañía matriz...');
    const companyCheck = await client.query(`
      SELECT id FROM companies WHERE name = 'Impulsa360'
    `);
    
    if (companyCheck.rows.length === 0) {
      // Si no existe, la creamos
      logToFile('Creando compañía matriz...');
      await client.query(`
        INSERT INTO companies (name, address, phone, email) VALUES
        ('Impulsa360', 'Dirección principal', '123456789', 'contacto@impulsa360.com')
      `);
    } else {
      // Si existe, la actualizamos
      logToFile('Actualizando compañía matriz existente...');
      await client.query(`
        UPDATE companies 
        SET address = 'Dirección principal', 
            phone = '123456789', 
            email = 'contacto@impulsa360.com'
        WHERE name = 'Impulsa360'
      `);
    }

    // 5. Crear usuario superadmin si no existe
    logToFile('Creando usuario superadmin...');
    await client.query(`
      INSERT INTO users (username, password, email, role_id, company_id, is_superadmin)
      SELECT 
        'superadmin',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
        'superadmin@impulsa360.com',
        r.id,
        c.id,
        true
      FROM roles r, companies c
      WHERE r.name = 'superadmin' AND c.name = 'Impulsa360'
      ON CONFLICT (username) DO NOTHING;
    `);

    await client.query('COMMIT');
    logToFile('✅ Seeder ejecutado con éxito');
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    logToFile(`❌ Error en el seeder: ${err.message}`);
    logToFile(`Stack: ${err.stack}`);
    throw err;
  } finally {
    if (client) client.release();
    await pool.end().catch(() => {});
  }
}

// Manejo de errores mejorado
seed()
  .then(() => {
    console.log('🚀 Proceso de seed completado');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Error fatal:', err.message);
    process.exit(1);
  });