import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import userCompanyRoutes from './routes/userCompanyRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Importar conexión a base de datos
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase usando la clave anónima pública
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Configuración
const PORT = process.env.PORT || 3001;

// Configurar JWT
process.env.JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

// Rutas
app.use('/api', authRoutes);
app.use('/api', userCompanyRoutes);

// Endpoint para obtener el usuario actual
app.get('/api/user', authMiddleware, (req, res) => {
  // En un entorno real, decodificaríamos el token y obtendríamos 
  // los datos del usuario desde la base de datos
  
  // Para este ejemplo, retornamos un usuario dummy
  res.json({
    id: 1,
    username: 'admin_user',
    email: 'admin@example.com',
    role: 'Administrator',
    is_superadmin: true,
    avatar: null
  });
});

// Endpoints para obtener datos reales de la base de datos
// Endpoint para obtener usuarios
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: error.message });
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

// Endpoints para compañías
app.get('/api/companies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) throw error;
    
    res.json({ data });
  } catch (error) {
    console.error('Error obteniendo compañías:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para actualizar compañías
app.put('/api/companies/:id', async (req, res) => {
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Configuración Supabase:');
  console.log(`- URL: ${process.env.SUPABASE_URL || 'No configurada'}`);
});
