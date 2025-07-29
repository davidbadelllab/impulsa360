import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import userCompanyRoutes from './routes/companyRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';
import SocketService from './services/socketService.js';

// Definición de tipos
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_superadmin: boolean;
  avatar: string | null;
}

interface Company {
  id: string;
  name: string;
  // Agregar más campos según la estructura real
}

const app: Express = express();
const server = createServer(app);

// Configurar Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Hacer io disponible en req
app.use((req: Request, res: Response, next) => {
  (req as any).io = io;
  next();
});

// Configuración de Supabase
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Configuración
const PORT: string | number = process.env.PORT || 3000

// Configurar JWT
process.env.JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Rutas
app.use('/api', authRoutes);
app.use('/api', userCompanyRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meetings', meetingRoutes);

// Endpoint para obtener el usuario actual
app.get('/api/user', authMiddleware, (req: Request, res: Response<User>) => {
  res.json({
    id: 1,
    username: 'admin_user',
    email: 'admin@example.com',
    role: 'Administrator',
    is_superadmin: true,
    avatar: null
  });
});

// Endpoints para obtener datos de la base de datos
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener roles
app.get('/api/roles', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoints para compañías
app.get('/api/companies', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo compañías:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para actualizar compañías
app.put('/api/companies/:id', async (req: Request<{id: string}>, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error actualizando compañía:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener clientes
app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener equipos
app.get('/api/teams', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener servicios
app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener servicios contratados por compañías
app.get('/api/company-services', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('company_services')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo servicios de compañías:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Endpoint para obtener planes
app.get('/api/plans', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// ===== RUTAS DE COMPANIES =====
// Obtener todas las compañías
app.get('/api/companies', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching companies');
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Supabase error fetching companies:', error);
      throw error;
    }
    
    console.log(`✅ Fetched ${data?.length || 0} companies successfully`);
    res.json({ 
      success: true,
      data: data || [] 
    });
  } catch (error) {
    console.error('💥 Error fetching companies:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Obtener una compañía por ID
app.get('/api/companies/:id', async (req: Request, res: Response) => {
  try {
    console.log('📋 Fetching company:', req.params.id);
    
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      console.error('❌ Supabase error fetching company:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          message: 'Compañía no encontrada' 
        });
      }
      throw error;
    }
    
    console.log('✅ Company fetched successfully:', data.id);
    res.json({ 
      success: true,
      data: data 
    });
  } catch (error) {
    console.error('💥 Error fetching company:', error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Crear una nueva compañía
app.post('/api/companies', async (req: Request, res: Response) => {
  try {
    console.log('📝 Creating company:', req.body);
    
    const companyData: any = {
      name: req.body.name,
      address: req.body.address || null,
      email: req.body.email || null,
      phone: req.body.phone || null
    };
    
    // Asegurar campos timestamp
    companyData.created_at = new Date().toISOString();
    companyData.updated_at = new Date().toISOString();
    
    // Manejar posibles alias camelCase
    if (req.body.createdAt) {
      companyData.created_at = req.body.createdAt;
    }
    if (req.body.updatedAt) {
      companyData.updated_at = req.body.updatedAt;
    }
    
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error creating company:', error);
      throw error;
    }
    
    console.log('✅ Company created successfully:', data.id);
    res.status(201).json({
      success: true,
      message: 'Compañía creada exitosamente',
      data: data
    });
  } catch (error) {
    console.error('💥 Error creating company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creando compañía',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Actualizar una compañía
app.put('/api/companies/:id', async (req: Request, res: Response) => {
  try {
    console.log('📝 Updating company:', req.params.id, req.body);
    
    // Verificar y preparar datos de actualización
    const updateData = {
      ...req.body
    };
    
    // Asegurar campo updated_at existe
    if (!updateData.updated_at && !updateData.updatedAt) {
      updateData.updated_at = new Date().toISOString();
    } else if (updateData.updatedAt) {
      updateData.updated_at = updateData.updatedAt;
      delete updateData.updatedAt;
    }
    
    const { data, error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase error updating company:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false, 
          message: 'Compañía no encontrada' 
        });
      }
      throw error;
    }
    
    console.log('✅ Company updated successfully:', data.id);
    res.json({
      success: true,
      message: 'Compañía actualizada exitosamente',
      data: data
    });
  } catch (error) {
    console.error('💥 Error updating company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error actualizando compañía',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Eliminar una compañía
app.delete('/api/companies/:id', async (req: Request, res: Response) => {
  try {
    console.log('🗑️ Deleting company:', req.params.id);
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de compañía inválido'
      });
    }
    
    // Verificar si la compañía existe
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('❌ Error fetching company:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Compañía no encontrada'
        });
      }
      throw fetchError;
    }
    
    if (!existingCompany) {
      console.log('❌ Company not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Compañía no encontrada'
      });
    }
    
    console.log('✅ Company found:', existingCompany.name);
    
    // Verificar dependencias antes de eliminar
    const dependencies = [];
    
    try {
      // Verificar usuarios asociados
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', id);
      
      if (usersError) {
        console.error('❌ Error checking users:', usersError);
      } else if (users && users.length > 0) {
        dependencies.push(`${users.length} usuario(s) asociado(s)`);
      }
      
      // Verificar clientes asociados
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', id);
      
      if (clientsError) {
        console.error('❌ Error checking clients:', clientsError);
      } else if (clients && clients.length > 0) {
        dependencies.push(`${clients.length} cliente(s) asociado(s)`);
      }
      
      // Verificar equipos asociados
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .eq('company_id', id);
      
      if (teamsError) {
        console.error('❌ Error checking teams:', teamsError);
      } else if (teams && teams.length > 0) {
        dependencies.push(`${teams.length} equipo(s) asociado(s)`);
      }
    } catch (dependencyError) {
      console.error('❌ Error checking dependencies:', dependencyError);
      // Continuar con la eliminación incluso si hay error en dependencias
    }
    
    // Si hay dependencias, no permitir eliminación
    if (dependencies.length > 0) {
      console.log('⚠️ Company has dependencies:', dependencies);
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar la compañía porque tiene dependencias asociadas (clientes, equipos o usuarios). Elimine las dependencias primero.',
        dependencies: dependencies
      });
    }
    
    console.log('✅ No dependencies found, proceeding with deletion');
    
    // Proceder con la eliminación
    const { data: deletedCompany, error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (deleteError) {
      console.error('❌ Supabase error deleting company:', deleteError);
      throw deleteError;
    }
    
    console.log('✅ Company deleted successfully:', deletedCompany.id);
    res.json({
      success: true,
      message: 'Compañía eliminada exitosamente',
      data: deletedCompany
    });
  } catch (error) {
    console.error('💥 Error deleting company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error eliminando compañía',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Inicializar servicio de sockets
new SocketService(io);

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Socket.IO configurado para videoconferencias');
  console.log('Configuración Supabase:');
  console.log(`- URL: ${process.env.SUPABASE_URL || 'No configurada'}`);
});
