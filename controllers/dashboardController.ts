import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// Obtener total de usuarios registrados
export const getUsersCount = async (req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    if (error) {
      return res.status(500).json({ error: 'Error obteniendo el total de usuarios' });
    }
    res.json({ total: count });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener total de empresas registradas
export const getCompaniesCount = async (req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });
    if (error) {
      return res.status(500).json({ error: 'Error obteniendo el total de empresas' });
    }
    res.json({ total: count });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener total de citas y desglose por estado
export const getAppointmentsStats = async (req: Request, res: Response) => {
  try {
    // Total de citas
    const { count: total, error: totalError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });
    if (totalError) {
      return res.status(500).json({ error: 'Error obteniendo el total de citas' });
    }
    // Citas por estado (agrupación manual)
    const { data: allAppointments, error: statusError } = await supabase
      .from('appointments')
      .select('status');
    if (statusError) {
      return res.status(500).json({ error: 'Error obteniendo citas por estado' });
    }
    const byStatus: Record<string, number> = {};
    allAppointments?.forEach(a => {
      if (!byStatus[a.status]) byStatus[a.status] = 0;
      byStatus[a.status]++;
    });
    res.json({ total, byStatus });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener total de archivos por usuario, con fecha y tipo
export const getFilesStats = async (req: Request, res: Response) => {
  try {
    // Archivos agrupados por usuario
    const { data, error } = await supabase
      .from('files')
      .select('user_id, original_name, mime_type, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: 'Error obteniendo archivos' });
    }
    // Agrupar por usuario
    const filesByUser: Record<string, { name: string; type: string; date: string }[]> = {};
    data?.forEach(file => {
      if (!filesByUser[file.user_id]) filesByUser[file.user_id] = [];
      filesByUser[file.user_id].push({
        name: file.original_name,
        type: file.mime_type,
        date: file.created_at
      });
    });
    res.json({ filesByUser });
  } catch {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 