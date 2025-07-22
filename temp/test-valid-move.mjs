import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testValidMove() {
  try {
    console.log('🧪 Probando movimiento con IDs válidos...');
    
    // Obtener una tarjeta del board 1
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, title, list_id')
      .eq('list_id', 1) // Tarjetas en "Pendiente"
      .limit(1);
    
    if (cardsError || !cards || cards.length === 0) {
      console.error('❌ No se encontraron tarjetas en Pendiente');
      return;
    }
    
    const card = cards[0];
    console.log('📋 Tarjeta a mover:', card);
    
    // Mover de "Pendiente" (ID: 1) a "En Progreso" (ID: 2)
    console.log('🔄 Moviendo de Pendiente (ID: 1) a En Progreso (ID: 2)...');
    
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        list_id: 2, // En Progreso
        position: 0 
      })
      .eq('id', card.id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error moviendo tarjeta:', error);
      return;
    }

    console.log('✅ Tarjeta movida exitosamente:', data);
    
    // Verificar el cambio
    const { data: updatedCard, error: verifyError } = await supabase
      .from('cards')
      .select('id, title, list_id')
      .eq('id', card.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verificando cambio:', verifyError);
    } else {
      console.log('✅ Verificación - Tarjeta ahora está en list_id:', updatedCard.list_id);
    }
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

testValidMove(); 