import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Configuración de Supabase usando la clave de servicio para operaciones administrativas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SALT_ROUNDS = 10;

async function createTestUsers() {
  try {
    console.log('🚀 Creando usuarios de prueba...');

    const users = [
      {
        email: 'admin@impulsa360.com',
        password: 'password',
        username: 'Admin Impulsa360',
        role_id: 1, // super_admin
        is_superadmin: true,
        status: 'active'
      },
      {
        email: 'test@example.com',
        password: 'password', 
        username: 'Usuario Test',
        role_id: 7, // admin
        is_superadmin: false,
        status: 'active'
      },
      {
        email: 'demo@impulsa360.com',
        password: 'demo123',
        username: 'Usuario Demo',
        role_id: 9, // agent
        is_superadmin: false,
        status: 'active'
      }
    ];

    for (const user of users) {
      console.log(`📝 Creando usuario: ${user.email}`);
      
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (existingUser) {
        console.log(`⚠️  Usuario ${user.email} ya existe, actualizando contraseña...`);
        
        // Actualizar la contraseña
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            password: hashedPassword,
            username: user.username,
            role_id: user.role_id,
            is_superadmin: user.is_superadmin,
            status: user.status
          })
          .eq('email', user.email);

        if (updateError) {
          console.error(`❌ Error actualizando ${user.email}:`, updateError);
        } else {
          console.log(`✅ Usuario ${user.email} actualizado`);
        }
      } else {
        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        const { data, error } = await supabase
          .from('users')
          .insert([{
            email: user.email,
            password: hashedPassword,
            username: user.username,
            role_id: user.role_id,
            is_superadmin: user.is_superadmin,
            status: user.status,
            created_at: new Date().toISOString()
          }])
          .select();

        if (error) {
          console.error(`❌ Error creando ${user.email}:`, error);
        } else {
          console.log(`✅ Usuario ${user.email} creado exitosamente`);
        }
      }
    }

    console.log('\n🎉 Proceso completado! Usuarios disponibles:');
    console.log('👤 admin@impulsa360.com - password: password (Super Admin)');
    console.log('👤 test@example.com - password: password (Admin)');
    console.log('👤 demo@impulsa360.com - password: demo123 (Usuario)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

createTestUsers();
