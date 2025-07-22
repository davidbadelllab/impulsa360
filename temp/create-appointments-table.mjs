import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentsTable() {
  try {
    // Primero intentamos hacer una consulta para ver si la tabla existe
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);

    if (error) {
      console.log('La tabla appointments no existe aún:', error.message);
      console.log('Necesitas crear la tabla manualmente en Supabase con estos campos:');
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
      console.log('La tabla appointments ya existe');
      console.log('Datos actuales:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testAppointmentsTable(); 