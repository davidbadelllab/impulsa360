import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usar exactamente la misma configuración que funciona
const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // SERVICE_ROLE_KEY

console.log('🔧 Configuración Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key configurada:', supabaseKey ? 'Sí' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function testMoveCard() {
  try {
    console.log('🔍 Probando movimiento de tarjeta 7 a lista 13...');
    
    // Primero verificar que la tarjeta existe
    const { data: existingCard, error: checkError } = await supabase
      .from('cards')
      .select('id, title, list_id, position')
      .eq('id', 7)
      .single();

    if (checkError) {
      console.error('❌ Error verificando tarjeta:', checkError);
      return;
    }

    console.log('✅ Tarjeta encontrada:', existingCard);

    // Actualizar la tarjeta y obtener el resultado
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        list_id: 13, 
        position: 0 
      })
      .eq('id', 7)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error actualizando tarjeta:', error);
      return;
    }

    console.log('✅ Tarjeta movida exitosamente:', data);
    
    // Verificar que el cambio se aplicó
    const { data: updatedCard, error: verifyError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', 7)
      .single();
    
    if (verifyError) {
      console.error('❌ Error verificando cambio:', verifyError);
    } else {
      console.log('✅ Verificación - Tarjeta actualizada:', updatedCard);
    }
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error);
  }
}

testMoveCard(); 