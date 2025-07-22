const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SALT_ROUNDS = 10;

async function seedAdminUser() {
  try {
    const email = 'admin@impulsa360.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          password: hashedPassword,
          role: 'super_admin',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) throw error;

    console.log('Usuario admin creado exitosamente:');
    console.log(data);
    process.exit(0);
  } catch (error) {
    console.error('Error creando usuario admin:');
    console.error(error);
    process.exit(1);
  }
}

seedAdminUser();
