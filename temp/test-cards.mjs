import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testCards() {
  console.log('Testing cards in database...');
  
  // Obtener todas las tarjetas
  const { data: cards, error } = await supabase
    .from('cards')
    .select('id, title, list_id, position')
    .order('id');
  
  if (error) {
    console.error('Error fetching cards:', error);
    return;
  }
  
  console.log('Cards found:', cards.length);
  cards.forEach(card => {
    console.log(`- Card ID: ${card.id}, Title: "${card.title}", List: ${card.list_id}, Position: ${card.position}`);
  });
  
  // Probar actualizar una tarjeta específica
  if (cards.length > 0) {
    const testCard = cards[0];
    console.log(`\nTesting update of card ${testCard.id}...`);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('cards')
      .update({ position: testCard.position + 1 })
      .eq('id', testCard.id)
      .select();
    
    if (updateError) {
      console.error('Error updating card:', updateError);
    } else {
      console.log('Update successful:', updateResult);
    }
  }
}

testCards().catch(console.error); 