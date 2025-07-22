import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkTables() {
  try {
    console.log('Verificando tablas existentes...')
    
    // Consultar tabla users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (usersError && usersError.code !== '42P01') throw usersError
    console.log(usersError ? '❌ Tabla users NO existe' : '✅ Tabla users existe')

    // Consultar tabla companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1)

    if (companiesError && companiesError.code !== '42P01') throw companiesError
    console.log(companiesError ? '❌ Tabla companies NO existe' : '✅ Tabla companies existe')

    process.exit(0)
  } catch (error) {
    console.error('Error verificando tablas:', error.message)
    process.exit(1)
  }
}

checkTables()
