import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
  try {
    console.log('🔍 Verificando tabla de roles...');
    
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id');

    if (error) {
      console.error('❌ Error consultando tabla roles:', error);
    } else {
      console.log('✅ Roles disponibles:');
      data.forEach(role => {
        console.log(`  ID: ${role.id} - Nombre: ${role.name} - Descripción: ${role.description || 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  process.exit(0);
}

checkRoles();
