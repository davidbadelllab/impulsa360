import { createClient } from '@supabase/supabase-js';

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';
const supabase = createClient(supabaseUrl, supabaseKey);

class BriefingController {
    // Obtener todos los briefings
    async index(req, res) {
        try {
            console.log('🔍 Getting briefings...');
            const { data, error } = await supabase
                .from('briefing')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('❌ Error getting briefings:', error);
                throw error;
            }
            
            console.log('✅ Briefings retrieved successfully:', data?.length || 0);
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in briefings index:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener un briefing específico
    async show(req, res) {
        try {
            const { id } = req.params;
            console.log('🔍 Getting briefing:', id);
            
            const { data, error } = await supabase
                .from('briefing')
                .select('*')
                .eq('id', id)
                .single();
                
            if (error) {
                console.error('❌ Error getting briefing:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Briefing not found' });
            }
            
            console.log('✅ Briefing retrieved successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in briefing show:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Crear un nuevo briefing
    async create(req, res) {
        try {
            const { 
                type, 
                category, 
                title,
                description,
                company_id,
                priority,
                due_date,
                status = 'pending', 
                is_read = false 
            } = req.body;
            console.log('📝 Creating briefing:', { type, category, title, status, is_read });
            
            if (!type || !title) {
                return res.status(400).json({ success: false, message: 'Type and title are required' });
            }
            
            const { data, error } = await supabase
                .from('briefing')
                .insert([{ 
                    type, 
                    category, 
                    title,
                    description,
                    company_id,
                    priority,
                    due_date,
                    status, 
                    is_read,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error creating briefing:', error);
                throw error;
            }
            
            console.log('✅ Briefing created successfully');
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in briefing create:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Actualizar un briefing
    async update(req, res) {
        try {
            const { id } = req.params;
            const { 
                type, 
                category, 
                title,
                description,
                company_id,
                priority,
                due_date,
                status, 
                is_read 
            } = req.body;
            console.log('📝 Updating briefing:', id, { type, category, title, status, is_read });
            
            const updateData = {
                updated_at: new Date().toISOString()
            };
            
            if (type !== undefined) updateData.type = type;
            if (category !== undefined) updateData.category = category;
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (company_id !== undefined) updateData.company_id = company_id;
            if (priority !== undefined) updateData.priority = priority;
            if (due_date !== undefined) updateData.due_date = due_date;
            if (status !== undefined) updateData.status = status;
            if (is_read !== undefined) updateData.is_read = is_read;
            
            const { data, error } = await supabase
                .from('briefing')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error updating briefing:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Briefing not found' });
            }
            
            console.log('✅ Briefing updated successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in briefing update:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Eliminar un briefing
    async delete(req, res) {
        try {
            const { id } = req.params;
            console.log('🗑️ Deleting briefing:', id);
            
            const { error } = await supabase
                .from('briefing')
                .delete()
                .eq('id', id);
                
            if (error) {
                console.error('❌ Error deleting briefing:', error);
                throw error;
            }
            
            console.log('✅ Briefing deleted successfully');
            res.json({ success: true, message: 'Briefing deleted successfully' });
        } catch (error) {
            console.error('💥 Error in briefing delete:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener briefings por empresa
    async getByCompany(req, res) {
        try {
            const { companyId } = req.params;
            console.log('🏢 Getting briefings for company:', companyId);
            
            const { data, error } = await supabase
                .from('companybriefing')
                .select(`
                    briefing:briefing_id (
                        id,
                        type,
                        category,
                        status,
                        is_read,
                        created_at,
                        updated_at
                    )
                `)
                .eq('company_id', companyId);
                
            if (error) {
                console.error('❌ Error getting company briefings:', error);
                throw error;
            }
            
            const briefings = data?.map(item => item.briefing) || [];
            console.log('✅ Company briefings retrieved:', briefings.length);
            res.json({ success: true, data: briefings });
        } catch (error) {
            console.error('💥 Error in company briefings:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Asignar briefing a empresa
    async assignToCompany(req, res) {
        try {
            const { briefingId, companyId } = req.body;
            console.log('🔗 Assigning briefing to company:', { briefingId, companyId });
            
            if (!briefingId || !companyId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Briefing ID and Company ID are required' 
                });
            }
            
            const { data, error } = await supabase
                .from('companybriefing')
                .insert([{ 
                    briefing_id: briefingId, 
                    company_id: companyId,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error assigning briefing to company:', error);
                throw error;
            }
            
            console.log('✅ Briefing assigned to company successfully');
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in assign briefing:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new BriefingController();
