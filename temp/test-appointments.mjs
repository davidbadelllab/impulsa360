import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointments() {
  try {
    // Primero intentamos insertar una cita de prueba
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error insertando cita:', error);
      console.log('Probablemente la tabla no existe aún.');
      console.log('Necesitas crear la tabla manualmente en Supabase con este SQL:');
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
    } else {
      console.log('Cita insertada exitosamente:', data);
      
      // Ahora obtenemos todas las citas
      const { data: allAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('*');
      
      if (fetchError) {
        console.error('Error obteniendo citas:', fetchError);
      } else {
        console.log('Todas las citas:', allAppointments);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testAppointments(); 