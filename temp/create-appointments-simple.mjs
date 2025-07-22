import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAppointmentsTable() {
  try {
    console.log('Intentando crear la tabla appointments...');
    
    // Primero verificamos si podemos conectar
    const { data: testData, error: testError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('Error al consultar la tabla:', testError.message);
      
      if (testError.code === 'PGRST116') {
        console.log('La tabla no existe. Necesitas crear la tabla manualmente en Supabase SQL Editor.');
        console.log('Ve a tu dashboard de Supabase → SQL Editor y ejecuta:');
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
        
        console.log('Después de crear la tabla, ejecuta este script nuevamente.');
      } else {
        console.log('Error desconocido:', testError);
      }
    } else {
      console.log('¡La tabla appointments ya existe!');
      console.log('Datos existentes:', testData);
      
      // Insertar datos de prueba
      const { data: insertData, error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            name: 'Juan Pérez',
            email: 'juan@example.com',
            company: 'Empresa Test',
            phone: '+58 412 123 4567',
            date: '2024-12-20',
            time: '10:00',
            type: 'video',
            message: 'Cita de prueba',
            status: 'pending'
          }
        ])
        .select();

      if (insertError) {
        console.log('Error insertando datos de prueba:', insertError.message);
      } else {
        console.log('Datos de prueba insertados exitosamente:', insertData);
      }
    }
  } catch (err) {
    console.error('Error general:', err);
  }
}

createAppointmentsTable(); 