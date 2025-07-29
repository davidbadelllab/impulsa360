import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userCompanyRoutes from './routes/userCompanyRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import briefingRoutes from './routes/briefingRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { listRoutes } from './debug-routes.js';

const app = express();
app.use(cors());
// Aumentar límite del cuerpo de las peticiones para permitir subida de imágenes
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Importar conexión a base de datos
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase usando la clave anónima pública
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Configuración
const PORT = process.env.PORT || 3000;

// Configurar JWT con fallback más robusto
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'fallback_secret_key_2024';
process.env.JWT_SECRET = JWT_SECRET;

console.log('JWT_SECRET configurado:', JWT_SECRET ? 'Sí' : 'No');
console.log('Puerto del servidor:', PORT);

// Rutas
app.use('/api', authRoutes);
app.use('/api', userCompanyRoutes); // Monta las rutas de usuarios y otras entidades
app.use('/api', companyRoutes); // Este archivo maneja /plans
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/briefings', briefingRoutes);

// Endpoint para obtener el usuario actual está manejado por authRoutes

// Endpoint de login directo como respaldo (en caso de problemas con authRoutes)
app.post('/api/login', async (req, res) => {
  try {
    console.log('🔐 Login directo attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }
    
    // Importar dinámicamente el controlador
    const authController = await import('./controllers/authController.js');
    const { token } = await authController.login(email, password);
    
    console.log('🔐 Login directo successful for:', email);
    res.json({ token });
  } catch (error) {
    console.error('🔐 Login directo error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// Endpoint de prueba para verificar autenticación
app.get('/api/test-auth', authMiddleware, (req, res) => {
  console.log('req.user en test-auth:', req.user);
  res.json({
    message: 'Autenticación exitosa',
    user: req.user
  });
});

// Endpoints para obtener datos reales de la base de datos
// Endpoint para obtener usuarios
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Fetching users');
    
    // Obtener usuarios activos (no eliminados)
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        role_id,
        company_id,
        status,
        is_superadmin,
        last_login,
        created_at,
        updated_at,
        deleted_at
      `)
      .is('deleted_at', null) // Solo usuarios no eliminados
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Supabase error fetching users:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} users successfully`);
    res.json({ 
      success: true,
      data: data || [] 
    });
  } catch (error) {
    console.error('💥 Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Endpoint para crear usuarios
app.post('/api/users', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Creating user:', req.body);
    const userData = req.body;
    
    // Validar datos requeridos
    if (!userData.username || !userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email y password son requeridos'
      });
    }
    
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single();
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.username === userData.username 
          ? 'El nombre de usuario ya existe' 
          : 'El email ya existe'
      });
    }
    
    // Preparar datos del usuario
    const newUserData = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role_id: userData.role_id || 2, // Default role
      company_id: userData.company_id || null,
      status: userData.status || 'active',
      is_superadmin: userData.is_superadmin || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Hashear la contraseña
    const bcrypt = await import('bcryptjs');
    newUserData.password = await bcrypt.default.hash(newUserData.password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([newUserData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error creating user:', error);
      throw error;
    }
    
    console.log('✅ User created successfully:', data.id);
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        role_id: data.role_id,
        company_id: data.company_id,
        status: data.status,
        is_superadmin: data.is_superadmin,
        created_at: data.created_at
      }
    });
  } catch (error) {
    console.error('💥 Error creating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creando usuario',
      error: error.message 
    });
  }
});

// Endpoint para actualizar usuarios
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    console.log('📝 Updating user:', req.params.id, req.body);
    const { id } = req.params;
    const updateData = req.body;
    
    // Hashear la contraseña si se está actualizando
    if (updateData.password) {
      const bcrypt = await import('bcryptjs');
      updateData.password = await bcrypt.default.hash(updateData.password, 10);
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error updating user:', error);
      throw error;
    }
    
    console.log('✅ User updated successfully:', data.id);
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: data
    });
  } catch (error) {
    console.error('💥 Error updating user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error actualizando usuario',
      error: error.message 
    });
  }
});

// Endpoint para eliminar usuarios
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ Deleting user:', req.params.id);
    const { id } = req.params;
    
    // Verificar si el usuario existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingUser) {
      console.log('❌ User not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar si hay dependencias críticas antes de eliminar
    // Buscar en tablas que podrían tener referencias al usuario
    const dependencies = [];
    
    // Verificar en team_members
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', id);
    if (teamMembers && teamMembers.length > 0) {
      dependencies.push(`Miembro de ${teamMembers.length} equipo(s)`);
    }
    
    // Verificar en tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', id);
    if (tasks && tasks.length > 0) {
      dependencies.push(`${tasks.length} tarea(s) asignada(s)`);
    }
    
    // Verificar en task_comments
    const { data: taskComments } = await supabase
      .from('task_comments')
      .select('id')
      .eq('user_id', id);
    if (taskComments && taskComments.length > 0) {
      dependencies.push(`${taskComments.length} comentario(s) en tareas`);
    }
    
    // Verificar en meetings
    const { data: meetings } = await supabase
      .from('meetings')
      .select('id')
      .eq('host_id', id);
    if (meetings && meetings.length > 0) {
      dependencies.push(`${meetings.length} reunión(es) como anfitrión`);
    }
    
    // Verificar en meeting_participants
    const { data: meetingParticipants } = await supabase
      .from('meeting_participants')
      .select('id')
      .eq('user_id', id);
    if (meetingParticipants && meetingParticipants.length > 0) {
      dependencies.push(`Participante en ${meetingParticipants.length} reunión(es)`);
    }
    
    // Si hay dependencias, hacer soft delete en lugar de hard delete
    if (dependencies.length > 0) {
      console.log('⚠️ User has dependencies, performing soft delete:', dependencies);
      
      const { data: softDeletedUser, error: softDeleteError } = await supabase
        .from('users')
        .update({ 
          status: 'inactive',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (softDeleteError) {
        console.error('❌ Error in soft delete:', softDeleteError);
        throw softDeleteError;
      }
      
      console.log('✅ User soft deleted successfully:', softDeletedUser.id);
      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente (tiene dependencias activas)',
        data: softDeletedUser,
        dependencies: dependencies
      });
    } else {
      // No hay dependencias, proceder con eliminación física
      console.log('✅ No dependencies found, performing hard delete');
      
      const { data: deletedUser, error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (deleteError) {
        console.error('❌ Supabase error deleting user:', deleteError);
        throw deleteError;
      }
      
      console.log('✅ User hard deleted successfully:', deletedUser.id);
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        data: deletedUser
      });
    }
  } catch (error) {
    console.error('💥 Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error eliminando usuario',
      error: error.message 
    });
  }
});

// Endpoint para obtener roles
app.get('/api/roles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener companies
app.get('/api/companies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo companies:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener clientes
app.get('/api/clients', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener equipos
app.get('/api/teams', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener servicios
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener servicios contratados por compañías
app.get('/api/company-services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo servicios de compañías:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener planes
app.get('/api/plans', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos estáticos del build de React
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all para APIs no encontradas (DEBE ir antes del SPA routing)
app.all('/api/*', (req, res) => {
  console.log(`❌ API endpoint no encontrado: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'API endpoint not found',
    method: req.method,
    path: req.path,
    message: 'Esta ruta de API no existe'
  });
});

// Diagnóstico de rutas en desarrollo
if (process.env.NODE_ENV !== 'production') {
  listRoutes(app);
}

// SPA routing (DEBE ir AL FINAL para no interceptar APIs)
app.get('*', (req, res) => {
  console.log(`🔄 SPA routing serving: ${req.path}`);
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Configuración Supabase:');
  console.log(`- URL: ${process.env.SUPABASE_URL || 'No configurada'}`);
  
  // Mostrar rutas importantes en producción
  console.log('\n🔗 Rutas críticas registradas:');
  console.log('POST /api/login - Autenticación');
  console.log('GET  /api/user - Usuario actual');
  console.log('GET  /api/users - Lista usuarios');
});
