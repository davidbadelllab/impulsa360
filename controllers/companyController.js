import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener todas las compañías
export const getAllCompanies = async (req, res) => {
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
      error: error.message 
    });
  }
};

// Obtener una compañía por ID
export const getCompanyById = async (req, res) => {
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
      error: error.message 
    });
  }
};

// Crear una nueva compañía
export const createCompany = async (req, res) => {
  try {
    console.log('📝 Creating company:', req.body);
    
    const companyData = {
      name: req.body.name,
      address: req.body.address || null,
      email: req.body.email || null,
      phone: req.body.phone || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
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
      error: error.message 
    });
  }
};

// Actualizar una compañía
export const updateCompany = async (req, res) => {
  try {
    console.log('📝 Updating company:', req.params.id, req.body);
    
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
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
      error: error.message 
    });
  }
};

// Eliminar una compañía
export const deleteCompany = async (req, res) => {
  try {
    console.log('🗑️ Deleting company:', req.params.id);
    const { id } = req.params;
    
    // Verificar si la compañía existe
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingCompany) {
      console.log('❌ Company not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Compañía no encontrada'
      });
    }
    
    // Verificar dependencias antes de eliminar
    const dependencies = [];
    
    // Verificar usuarios asociados
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', id);
    if (users && users.length > 0) {
      dependencies.push(`${users.length} usuario(s) asociado(s)`);
    }
    
    // Verificar clientes asociados
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('company_id', id);
    if (clients && clients.length > 0) {
      dependencies.push(`${clients.length} cliente(s) asociado(s)`);
    }
    
    // Verificar equipos asociados
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .eq('company_id', id);
    if (teams && teams.length > 0) {
      dependencies.push(`${teams.length} equipo(s) asociado(s)`);
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
      error: error.message 
    });
  }
};
