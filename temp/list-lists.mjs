import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function listLists() {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('id, name, position, board_id');
    if (error) {
      console.error('❌ Error obteniendo listas:', error);
      return;
    }
    console.log('📋 Listas (columnas) existentes:');
    data.forEach(l => {
      console.log(`ID: ${l.id} | Nombre: ${l.name} | Posición: ${l.position} | Board: ${l.board_id}`);
    });
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

listLists(); 