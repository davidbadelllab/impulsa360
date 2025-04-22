import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import userCompanyRoutes from './routes/companyRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { createClient } from '@supabase/supabase-js';

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
app.use(cors());
app.use(bodyParser.json());

// Configuración de Supabase
const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Configuración
const PORT: string | number = process.env.PORT || 3001;

// Configurar JWT
process.env.JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Rutas
app.use('/api', authRoutes);
app.use('/api', userCompanyRoutes);

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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Configuración Supabase:');
  console.log(`- URL: ${process.env.SUPABASE_URL || 'No configurada'}`);
});
