import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SALT_ROUNDS = 10;

async function seedAdminUser() {
  try {
    const username = 'admin';
    const email = 'admin@impulsa360.com';
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Verificar conexión con Supabase
    console.log('Verificando conexión con Supabase...');
    console.log('URL:', supabaseUrl);
    
    // Primero, verificamos si ya existen roles
    console.log('Verificando si existe el rol de super_admin...');
    const { data: existingRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .eq('name', 'super_admin');
      
    if (rolesError) {
      console.error('Error verificando roles:', rolesError);
      throw rolesError;
    }
    
    let roleId;
    
    // Si no existe el rol, lo creamos
    if (!existingRoles || existingRoles.length === 0) {
      console.log('Creando rol super_admin...');
      const { data: newRole, error: createRoleError } = await supabase
        .from('roles')
        .insert([
          {
            name: 'super_admin',
            description: 'Administrador con todos los permisos del sistema'
          }
        ])
        .select();
        
      if (createRoleError) {
        console.error('Error creando rol:', createRoleError);
        throw createRoleError;
      }
      
      roleId = newRole[0].id;
      console.log('Rol super_admin creado con ID:', roleId);
    } else {
      roleId = existingRoles[0].id;
      console.log('Rol super_admin ya existe con ID:', roleId);
    }
    
    // Verificamos si ya existe la compañía principal
    console.log('Verificando si existe la compañía principal...');
    const { data: existingCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('name', 'Impulsa 360');
      
    if (companiesError) {
      console.error('Error verificando compañías:', companiesError);
      throw companiesError;
    }
    
    let companyId;
    
    // Si no existe la compañía, la creamos
    if (!existingCompanies || existingCompanies.length === 0) {
      console.log('Creando compañía principal...');
      const { data: newCompany, error: createCompanyError } = await supabase
        .from('companies')
        .insert([
          {
            name: 'Impulsa 360',
            email: 'info@impulsa360.com',
            address: 'Dirección principal',
            phone: '+1234567890'
          }
        ])
        .select();
        
      if (createCompanyError) {
        console.error('Error creando compañía:', createCompanyError);
        throw createCompanyError;
      }
      
      companyId = newCompany[0].id;
      console.log('Compañía principal creada con ID:', companyId);
    } else {
      companyId = existingCompanies[0].id;
      console.log('Compañía principal ya existe con ID:', companyId);
    }

    // Verificamos si ya existe el usuario admin
    console.log('Verificando si ya existe el usuario admin...');
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
      
    if (usersError) {
      console.error('Error verificando usuarios:', usersError);
      throw usersError;
    }
    
    // Si no existe el usuario, lo creamos
    if (!existingUsers || existingUsers.length === 0) {
      console.log('Creando usuario admin...');
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username: username,
            email: email,
            password: hashedPassword,
            role_id: roleId,
            company_id: companyId,
            is_superadmin: true
          }
        ])
        .select();

      if (error) {
        console.error('Detalles del error al crear usuario:', error);
        throw error;
      }

      console.log('Usuario admin creado exitosamente:');
      console.log(data);
    } else {
      console.log('El usuario admin ya existe:');
      console.log(existingUsers[0]);
    }
    
    console.log('Proceso completado exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error en el proceso:');
    console.error(error);
    process.exit(1);
  }
}

seedAdminUser();