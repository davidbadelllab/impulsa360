import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla users...');
    
    // Intentar obtener un usuario existente para ver las columnas
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error consultando tabla users:', error);
    } else {
      console.log('✅ Datos de la tabla users:');
      if (data && data.length > 0) {
        console.log('Columnas disponibles:', Object.keys(data[0]));
        console.log('Ejemplo de usuario:', data[0]);
      } else {
        console.log('La tabla está vacía');
      }
    }

    // También vamos a intentar crear un usuario simple para ver qué campos acepta
    console.log('\n🧪 Probando inserción simple...');
    const testUser = {
      email: 'test-structure@example.com',
      password: 'hashedpassword123',
      username: 'Test User'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select();

    if (insertError) {
      console.log('❌ Error en inserción de prueba:', insertError);
    } else {
      console.log('✅ Inserción exitosa, estructura:', insertData[0]);
      
      // Limpiar el usuario de prueba
      await supabase
        .from('users')
        .delete()
        .eq('email', 'test-structure@example.com');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
  
  process.exit(0);
}

checkUserTable();
