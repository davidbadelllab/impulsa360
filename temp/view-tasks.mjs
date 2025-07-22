import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usar las variables de entorno del archivo .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Configuración Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key configurada:', supabaseKey ? 'Sí' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function viewTasks() {
  try {
    console.log('🔍 Obteniendo tareas...');
    
    const { data, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) {
      console.error('❌ Error obteniendo tareas:', error);
      return;
    }
    
    console.log('✅ Tareas obtenidas:', data);
    
    // Verificar específicamente la tarjeta 7
    console.log('🔍 Verificando tarjeta ID 7...');
    const { data: card7, error: card7Error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', 7);
    
    if (card7Error) {
      console.error('❌ Error verificando tarjeta 7:', card7Error);
    } else {
      console.log('📋 Tarjeta 7:', card7);
    }
    
    // Verificar lista 13
    console.log('🔍 Verificando lista ID 13...');
    const { data: list13, error: list13Error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', 13);
    
    if (list13Error) {
      console.error('❌ Error verificando lista 13:', list13Error);
    } else {
      console.log('📝 Lista 13:', list13);
    }
    
  } catch (error) {
    console.error('💥 Error en la consulta:', error);
  }
}

viewTasks(); 