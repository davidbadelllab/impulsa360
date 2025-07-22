import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function checkBoardData() {
  try {
    console.log('🔍 Verificando datos del board...');
    
    // Obtener todos los boards
    const { data: boards, error: boardsError } = await supabase
      .from('boards')
      .select('id, name, description');
    
    if (boardsError) {
      console.error('❌ Error obteniendo boards:', boardsError);
      return;
    }
    
    console.log('📋 Boards disponibles:');
    boards.forEach(board => {
      console.log(`Board ID: ${board.id} | Nombre: ${board.name}`);
    });
    
    // Para cada board, mostrar sus listas y tarjetas
    for (const board of boards) {
      console.log(`\n📋 Board ${board.id} - ${board.name}:`);
      
      // Obtener listas del board
      const { data: lists, error: listsError } = await supabase
        .from('lists')
        .select('id, name, position')
        .eq('board_id', board.id)
        .order('position');
      
      if (listsError) {
        console.error(`❌ Error obteniendo listas del board ${board.id}:`, listsError);
        continue;
      }
      
      console.log('  📝 Listas:');
      lists.forEach(list => {
        console.log(`    ID: ${list.id} | ${list.name} | Posición: ${list.position}`);
      });
      
      // Obtener tarjetas del board
      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('id, title, list_id, position')
        .in('list_id', lists.map(l => l.id))
        .order('list_id, position');
      
      if (cardsError) {
        console.error(`❌ Error obteniendo tarjetas del board ${board.id}:`, cardsError);
        continue;
      }
      
      console.log('  🃏 Tarjetas:');
      cards.forEach(card => {
        const listName = lists.find(l => l.id === card.list_id)?.name || 'Desconocida';
        console.log(`    ID: ${card.id} | "${card.title}" | Lista: ${listName} (${card.list_id}) | Pos: ${card.position}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkBoardData(); 