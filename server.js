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
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// Endpoint para obtener el usuario actual está manejado por authRoutes

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

// Manejar todas las rutas no-API (SPA routing)
app.get('*', (req, res) => {
  // No servir index.html para rutas de API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log('Configuración Supabase:');
  console.log(`- URL: ${process.env.SUPABASE_URL || 'No configurada'}`);
});
