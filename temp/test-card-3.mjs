import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usar exactamente la misma configuración que funciona
const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testCard3() {
  try {
    console.log('🔍 Probando movimiento de tarjeta 3 a lista 3...');
    
    // Verificar que la tarjeta 3 existe
    const { data: card3, error: card3Error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', 3)
      .single();
    
    if (card3Error) {
      console.error('❌ Error verificando tarjeta 3:', card3Error);
      return;
    }
    
    console.log('✅ Tarjeta 3 encontrada:', card3);
    
    // Verificar que la lista 3 existe
    const { data: list3, error: list3Error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', 3)
      .single();
    
    if (list3Error) {
      console.error('❌ Error verificando lista 3:', list3Error);
      return;
    }
    
    console.log('✅ Lista 3 encontrada:', list3);
    
    // Intentar mover la tarjeta 3 a la lista 3
    console.log('🔄 Moviendo tarjeta 3 a lista 3...');
    
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        list_id: 3, 
        position: 1 
      })
      .eq('id', 3)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error moviendo tarjeta:', error);
      return;
    }

    console.log('✅ Tarjeta movida exitosamente:', data);
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

testCard3(); 