import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Crear un plan
export const createPlan = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert([req.body])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      message: 'Plan creado exitosamente',
      data: data
    });
  } catch (error) {
    console.error('Error creando plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creando plan',
      error: error.message 
    });
  }
};

// Listar todos los planes
export const getAllPlans = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo planes',
      error: error.message 
    });
  }
};

// Obtener un plan por ID
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Plan no encontrado' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error obteniendo plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo plan',
      error: error.message 
    });
  }
};

// Actualizar un plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('plans')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Plan no encontrado' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: 'Plan actualizado exitosamente',
      data: data
    });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error actualizando plan',
      error: error.message 
    });
  }
};

// Eliminar un plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Plan no encontrado' 
        });
      }
      throw error;
    }
    
    res.json({
      success: true,
      message: 'Plan eliminado exitosamente',
      data: data
    });
  } catch (error) {
    console.error('Error eliminando plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error eliminando plan',
      error: error.message 
    });
  }
};
