import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
// Necesitamos usar la clave de servicio para crear tablas
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAppointmentsTable() {
  try {
    // Crear la tabla usando SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          company VARCHAR(255),
          phone VARCHAR(20),
          date DATE NOT NULL,
          time TIME NOT NULL,
          type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'phone', 'presencial')),
          message TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error) {
      console.error('Error creando la tabla:', error);
      console.log('Intentando crear la tabla manualmente...');
      
      // Intentar crear la tabla usando el método insert/select
      const { data: testData, error: testError } = await supabase
        .from('appointments')
        .select('*')
        .limit(1);

      if (testError && testError.code === 'PGRST116') {
        console.log('La tabla no existe. Necesitas crearla manualmente en Supabase SQL Editor:');
        console.log(`
          CREATE TABLE appointments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            company VARCHAR(255),
            phone VARCHAR(20),
            date DATE NOT NULL,
            time TIME NOT NULL,
            type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'phone', 'presencial')),
            message TEXT,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else if (!testError) {
        console.log('La tabla appointments ya existe');
      }
    } else {
      console.log('Tabla appointments creada exitosamente');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

createAppointmentsTable(); 