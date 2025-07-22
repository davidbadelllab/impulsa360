import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function testBoardMove() {
  try {
    console.log('🧪 Probando movimiento con validación de board...');
    
    // Obtener una tarjeta del board 1
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        id, 
        title, 
        list_id,
        lists!inner(board_id, name)
      `)
      .eq('lists.board_id', 1) // Board 1
      .limit(1);
    
    if (cardsError || !cards || cards.length === 0) {
      console.error('❌ No se encontraron tarjetas en el board 1');
      return;
    }
    
    const card = cards[0];
    console.log('📋 Tarjeta a mover:', card);
    console.log('Board de la tarjeta:', card.lists.board_id);
    console.log('Lista actual:', card.lists.name);
    
    // Obtener las listas del board 1
    const { data: lists, error: listsError } = await supabase
      .from('lists')
      .select('id, name, position')
      .eq('board_id', 1)
      .order('position');
    
    if (listsError) {
      console.error('❌ Error obteniendo listas del board 1:', listsError);
      return;
    }
    
    console.log('📝 Listas disponibles en el board 1:');
    lists.forEach(list => {
      console.log(`  ID: ${list.id} | ${list.name} | Pos: ${list.position}`);
    });
    
    // Encontrar una lista destino diferente a la actual
    const targetList = lists.find(l => l.id !== card.list_id);
    if (!targetList) {
      console.error('❌ No se encontró una lista destino válida');
      return;
    }
    
    console.log(`🔄 Moviendo de "${card.lists.name}" (ID: ${card.list_id}) a "${targetList.name}" (ID: ${targetList.id})...`);
    
    // Simular la lógica del backend
    // PASO 1: Verificar que la tarjeta existe y obtener su board
    const { data: existingCard, error: cardError } = await supabase
      .from('cards')
      .select(`
        id, 
        title, 
        list_id,
        lists!inner(board_id)
      `)
      .eq('id', card.id)
      .single();

    if (cardError) {
      console.error('❌ Error verificando tarjeta:', cardError);
      return;
    }

    const cardBoardId = existingCard.lists.board_id;
    console.log('✅ Tarjeta verificada, board:', cardBoardId);

    // PASO 2: Verificar que la lista destino existe y pertenece al mismo board
    const { data: existingList, error: listError } = await supabase
      .from('lists')
      .select('id, name, board_id')
      .eq('id', targetList.id)
      .eq('board_id', cardBoardId)
      .single();

    if (listError) {
      console.error('❌ Error verificando lista destino:', listError);
      return;
    }

    console.log('✅ Lista destino verificada:', existingList);

    // PASO 3: Actualizar la tarjeta
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        list_id: targetList.id, 
        position: 0 
      })
      .eq('id', card.id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error actualizando tarjeta:', error);
      return;
    }

    console.log('✅ Tarjeta movida exitosamente:', data);
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

testBoardMove(); 