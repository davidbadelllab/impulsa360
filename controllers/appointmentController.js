import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Controlador de appointments usando base de datos real de Supabase');

// Crear nueva cita
export const createAppointment = async (req, res) => {
  try {
    console.log('Datos recibidos en createAppointment:', req.body);
    const { name, email, company, phone, date, time, type, message } = req.body;

    // Validar campos requeridos
    if (!name || !email || !date || !time) {
      console.log('Validación fallida - campos requeridos:', { name, email, date, time });
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, fecha y hora son requeridos'
      });
    }

    // Validar formato de fecha y hora
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido'
      });
    }

    // Validar que la fecha sea futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: 'La fecha debe ser futura'
      });
    }

    // Validar tipo de cita
    const validTypes = ['video', 'phone', 'presencial'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de cita inválido'
      });
    }

    // Crear la cita en Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          name,
          email,
          company,
          phone,
          date,
          time,
          type: type || 'video',
          message,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creando cita en Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creando la cita'
      });
    }

    console.log('Cita creada en Supabase:', data);

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: data
    });

  } catch (error) {
    console.error('Error en createAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todas las citas
export const getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Construir query para Supabase
    let query = supabase
      .from('appointments')
      .select('*');

    // Filtrar por estado si se proporciona
    if (status) {
      query = query.eq('status', status);
    }

    // Filtrar por fecha si se proporciona
    if (date) {
      query = query.eq('date', date);
    }

    // Ordenar por fecha y hora
    query = query.order('date', { ascending: true }).order('time', { ascending: true });

    // Paginación
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error obteniendo citas de Supabase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo las citas'
      });
    }

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || data?.length || 0
      }
    });

  } catch (error) {
    console.error('Error en getAppointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener cita por ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo cita por ID:', error);
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error en getAppointmentById:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar cita
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, company, phone, date, time, type, message, status } = req.body;

    // Validar estado si se proporciona
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido'
      });
    }

    // Validar tipo si se proporciona
    const validTypes = ['video', 'phone', 'presencial'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de cita inválido'
      });
    }

    // Construir objeto de actualización
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;
    if (phone !== undefined) updateData.phone = phone;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (type !== undefined) updateData.type = type;
    if (message !== undefined) updateData.message = message;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando cita:', error);
      return res.status(500).json({
        success: false,
        message: 'Error actualizando la cita'
      });
    }

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: data
    });

  } catch (error) {
    console.error('Error en updateAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar cita
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando cita:', error);
      return res.status(500).json({
        success: false,
        message: 'Error eliminando la cita'
      });
    }

    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteAppointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de citas
export const getAppointmentStats = async (req, res) => {
  try {
    // Obtener todas las citas para calcular estadísticas
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('*');

    if (error) {
      console.error('Error obteniendo citas para estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }

    const appointmentsArray = appointments || [];
    
    // Calcular estadísticas
    const stats = {
      total: appointmentsArray.length,
      pending: appointmentsArray.filter(a => a.status === 'pending').length,
      confirmed: appointmentsArray.filter(a => a.status === 'confirmed').length,
      completed: appointmentsArray.filter(a => a.status === 'completed').length,
      cancelled: appointmentsArray.filter(a => a.status === 'cancelled').length,
      thisMonth: appointmentsArray.filter(a => {
        const appointmentDate = new Date(a.date);
        const now = new Date();
        return appointmentDate.getMonth() === now.getMonth() && 
               appointmentDate.getFullYear() === now.getFullYear();
      }).length
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error en getAppointmentStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}; 