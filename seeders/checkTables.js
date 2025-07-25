import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const tablesToCheck = ['companies', 'clients', 'teams', 'services', 'plans', 'company_services'];
  
  for (const table of tablesToCheck) {
    try {
      console.log(`🔍 Verificando tabla ${table}...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Error con tabla ${table}:`, error.message);
      } else {
        console.log(`✅ Tabla ${table} existe:`, data ? `${data.length} registros encontrados` : 'vacía');
        if (data && data.length > 0) {
          console.log(`   Columnas: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error general con tabla ${table}:`, error.message);
    }
    console.log('');
  }
  
  process.exit(0);
}

checkTables();
