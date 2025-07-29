import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';
const supabase = createClient(supabaseUrl, supabaseKey);

class BriefingController {
    // ===== CATEGORÍAS =====
    
    // Obtener todas las categorías
    async getCategories(req, res) {
        try {
            console.log('🔍 Getting briefing categories...');
            const { data, error } = await supabase
                .from('briefing_category')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
                
            if (error) {
                console.error('❌ Error getting categories:', error);
                throw error;
            }
            
            console.log('✅ Categories retrieved successfully:', data?.length || 0);
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in getCategories:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ===== TEMPLATES =====
    
    // Obtener todos los templates
    async getTemplates(req, res) {
        try {
            console.log('🔍 Getting briefing templates...');
            const { data, error } = await supabase
                .from('briefing_template')
                .select(`
                    *,
                    briefing_category:category_id (
                        id,
                        name,
                        description,
                        icon,
                        color
                    )
                `)
                .eq('is_active', true)
                .order('name', { ascending: true });
                
            if (error) {
                console.error('❌ Error getting templates:', error);
                throw error;
            }
            
            console.log('✅ Templates retrieved successfully:', data?.length || 0);
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in getTemplates:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener templates por categoría
    async getTemplatesByCategory(req, res) {
        try {
            const { categoryId } = req.params;
            console.log('🔍 Getting templates for category:', categoryId);
            
            const { data, error } = await supabase
                .from('briefing_template')
                .select(`
                    *,
                    briefing_category:category_id (
                        id,
                        name,
                        description,
                        icon,
                        color
                    )
                `)
                .eq('category_id', categoryId)
                .eq('is_active', true)
                .order('name', { ascending: true });
                
            if (error) {
                console.error('❌ Error getting templates by category:', error);
                throw error;
            }
            
            console.log('✅ Templates by category retrieved successfully');
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in getTemplatesByCategory:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener un template específico
    async getTemplate(req, res) {
        try {
            const { id } = req.params;
            console.log('🔍 Getting template:', id);
            
            const { data, error } = await supabase
                .from('briefing_template')
                .select(`
                    *,
                    briefing_category:category_id (
                        id,
                        name,
                        description,
                        icon,
                        color
                    )
                `)
                .eq('id', id)
                .eq('is_active', true)
                .single();
                
            if (error) {
                console.error('❌ Error getting template:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            
            console.log('✅ Template retrieved successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in getTemplate:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Crear un nuevo template
    async createTemplate(req, res) {
        try {
            const { 
                category_id, 
                name, 
                slug, 
                description, 
                estimated_duration, 
                price_range, 
                questions, 
                required_fields,
                form_settings 
            } = req.body;
            console.log('📝 Creating template:', { name, category_id });
            
            if (!category_id || !name || !slug || !questions) {
                return res.status(400).json({ success: false, message: 'Category ID, name, slug and questions are required' });
            }
            
            const { data, error } = await supabase
                .from('briefing_template')
                .insert([{ 
                    category_id,
                    name, 
                    slug,
                    description, 
                    estimated_duration, 
                    price_range, 
                    questions,
                    required_fields: required_fields || [],
                    form_settings: form_settings || {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error creating template:', error);
                throw error;
            }
            
            console.log('✅ Template created successfully');
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in createTemplate:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ===== BRIEFINGS =====
    
    // Crear un nuevo briefing (generar URL pública)
    async createBriefing(req, res) {
        try {
            const { 
                template_id, 
                company_name, 
                contact_name,
                contact_email, 
                contact_phone,
                contact_position,
                company_website,
                company_size,
                industry,
                expires_at,
                utm_source,
                utm_medium,
                utm_campaign,
                referrer
            } = req.body;
            console.log('📝 Creating briefing for:', company_name);
            
            if (!template_id || !company_name || !contact_name || !contact_email) {
                return res.status(400).json({ success: false, message: 'Template ID, company name, contact name and email are required' });
            }
            
            // Verificar que el template existe
            const { data: template, error: templateError } = await supabase
                .from('briefing_template')
                .select('*')
                .eq('id', template_id)
                .eq('is_active', true)
                .single();
                
            if (templateError || !template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            
            // Generar access_token y public_url únicos
            const access_token = require('crypto').randomBytes(32).toString('hex');
            const public_url = require('crypto').randomBytes(16).toString('hex');
            
            // Crear el briefing
            const { data, error } = await supabase
                .from('briefing')
                .insert([{ 
                    template_id,
                    company_name,
                    contact_name,
                    contact_email,
                    contact_phone,
                    contact_position,
                    company_website,
                    company_size,
                    industry,
                    responses: {},
                    form_progress: 0,
                    public_url,
                    access_token,
                    expires_at: expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días por defecto
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    referrer,
                    ip_address: req.ip,
                    user_agent: req.get('User-Agent'),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error creating briefing:', error);
                throw error;
            }
            
            // Generar QR code
            const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const publicUrl = `${baseUrl}/briefing/${data.public_url}`;
            
            const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);
            
            // Actualizar con el QR code
            const { error: updateError } = await supabase
                .from('briefing')
                .update({ qr_code_url: qrCodeDataUrl })
                .eq('id', data.id);
                
            if (updateError) {
                console.error('❌ Error updating QR code:', updateError);
            }
            
            console.log('✅ Briefing created successfully');
            res.status(201).json({ 
                success: true, 
                data: {
                    ...data,
                    public_url: publicUrl,
                    qr_code_url: qrCodeDataUrl
                }
            });
        } catch (error) {
            console.error('💥 Error in createBriefing:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener briefing por URL pública
    async getPublicBriefing(req, res) {
        try {
            const { publicUrl } = req.params;
            console.log('🔍 Getting public briefing:', publicUrl);
            
            const { data, error } = await supabase
                .from('briefing')
                .select(`
                    *,
                    briefing_template:template_id (
                        name,
                        slug,
                        description,
                        estimated_duration,
                        price_range,
                        questions,
                        required_fields,
                        form_settings,
                        briefing_category:category_id (
                            name,
                            description,
                            icon,
                            color
                        )
                    )
                `)
                .eq('public_url', publicUrl)
                .single();
                
            if (error) {
                console.error('❌ Error getting public briefing:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Briefing not found' });
            }
            
            // Verificar si ha expirado
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return res.status(410).json({ success: false, message: 'This briefing has expired' });
            }
            
            console.log('✅ Public briefing retrieved successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in getPublicBriefing:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Enviar respuestas del cliente
    async submitBriefing(req, res) {
        try {
            const { publicUrl } = req.params;
            const { responses, form_progress = 100 } = req.body;
            console.log('📝 Submitting briefing responses:', publicUrl);
            
            if (!responses) {
                return res.status(400).json({ success: false, message: 'Responses are required' });
            }
            
            const { data, error } = await supabase
                .from('briefing')
                .update({ 
                    responses,
                    form_progress,
                    status: 'submitted',
                    submitted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('public_url', publicUrl)
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error submitting briefing:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Briefing not found' });
            }
            
            console.log('✅ Briefing submitted successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in submitBriefing:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Actualizar progreso del formulario
    async updateProgress(req, res) {
        try {
            const { publicUrl } = req.params;
            const { responses, form_progress } = req.body;
            console.log('📝 Updating briefing progress:', publicUrl, form_progress);
            
            const { data, error } = await supabase
                .from('briefing')
                .update({ 
                    responses,
                    form_progress,
                    updated_at: new Date().toISOString()
                })
                .eq('public_url', publicUrl)
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error updating progress:', error);
                throw error;
            }
            
            if (!data) {
                return res.status(404).json({ success: false, message: 'Briefing not found' });
            }
            
            console.log('✅ Progress updated successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in updateProgress:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ===== ADMIN =====
    
    // Obtener todos los briefings (admin)
    async index(req, res) {
        try {
            console.log('🔍 Getting all briefings...');
            const { data, error } = await supabase
                .from('briefing')
                .select(`
                    *,
                    briefing_template:template_id (
                        name,
                        slug,
                        description,
                        briefing_category:category_id (
                            name,
                            color
                        )
                    )
                `)
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

    // Obtener briefings por estado
    async getByStatus(req, res) {
        try {
            const { status } = req.params;
            console.log('🔍 Getting briefings by status:', status);
            
            const { data, error } = await supabase
                .from('briefing')
                .select(`
                    *,
                    briefing_template:template_id (
                        name,
                        slug,
                        description,
                        briefing_category:category_id (
                            name,
                            color
                        )
                    )
                `)
                .eq('status', status)
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('❌ Error getting briefings by status:', error);
                throw error;
            }
            
            console.log('✅ Briefings by status retrieved successfully');
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in getByStatus:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener un briefing específico (admin)
    async show(req, res) {
        try {
            const { id } = req.params;
            console.log('🔍 Getting briefing:', id);
            
            const { data, error } = await supabase
                .from('briefing')
                .select(`
                    *,
                    briefing_template:template_id (
                        name,
                        slug,
                        description,
                        estimated_duration,
                        price_range,
                        questions,
                        required_fields,
                        form_settings,
                        briefing_category:category_id (
                            name,
                            description,
                            icon,
                            color
                        )
                    )
                `)
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

    // Actualizar briefing (admin)
    async update(req, res) {
        try {
            const { id } = req.params;
            const { 
                status, 
                priority, 
                estimated_budget, 
                quoted_budget,
                approved_budget,
                timeline_estimate,
                internal_notes, 
                client_feedback,
                assigned_to,
                is_read,
                is_archived
            } = req.body;
            console.log('📝 Updating briefing:', id, { status, priority });
            
            const updateData = {
                updated_at: new Date().toISOString()
            };
            
            if (status !== undefined) updateData.status = status;
            if (priority !== undefined) updateData.priority = priority;
            if (estimated_budget !== undefined) updateData.estimated_budget = estimated_budget;
            if (quoted_budget !== undefined) updateData.quoted_budget = quoted_budget;
            if (approved_budget !== undefined) updateData.approved_budget = approved_budget;
            if (timeline_estimate !== undefined) updateData.timeline_estimate = timeline_estimate;
            if (internal_notes !== undefined) updateData.internal_notes = internal_notes;
            if (client_feedback !== undefined) updateData.client_feedback = client_feedback;
            if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
            if (is_read !== undefined) updateData.is_read = is_read;
            if (is_archived !== undefined) updateData.is_archived = is_archived;
            
            // Auto-marcar fechas importantes
            if (status === 'approved' && status !== req.body.old_status) {
                updateData.approved_at = new Date().toISOString();
            } else if (status === 'completed' && status !== req.body.old_status) {
                updateData.completed_at = new Date().toISOString();
            } else if (status === 'in_review' && status !== req.body.old_status) {
                updateData.reviewed_at = new Date().toISOString();
            }
            
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

    // Eliminar briefing
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

    // ===== ESTADÍSTICAS =====
    
    // Obtener estadísticas generales
    async getStats(req, res) {
        try {
            console.log('📊 Getting briefing statistics...');
            
            // Usar la función de la base de datos
            const { data, error } = await supabase
                .rpc('get_briefing_stats');
                
            if (error) {
                console.error('❌ Error getting stats:', error);
                throw error;
            }
            
            console.log('✅ Statistics retrieved successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in getStats:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Obtener métricas de conversión por template
    async getTemplateMetrics(req, res) {
        try {
            console.log('📊 Getting template conversion metrics...');
            
            const { data, error } = await supabase
                .rpc('get_template_conversion_metrics');
                
            if (error) {
                console.error('❌ Error getting template metrics:', error);
                throw error;
            }
            
            console.log('✅ Template metrics retrieved successfully');
            res.json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in getTemplateMetrics:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // ===== COMENTARIOS =====
    
    // Obtener comentarios de un briefing
    async getComments(req, res) {
        try {
            const { briefingId } = req.params;
            console.log('💬 Getting comments for briefing:', briefingId);
            
            const { data, error } = await supabase
                .from('briefing_comments')
                .select('*')
                .eq('briefing_id', briefingId)
                .order('created_at', { ascending: true });
                
            if (error) {
                console.error('❌ Error getting comments:', error);
                throw error;
            }
            
            console.log('✅ Comments retrieved successfully');
            res.json({ success: true, data: data || [] });
        } catch (error) {
            console.error('💥 Error in getComments:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Agregar comentario
    async addComment(req, res) {
        try {
            const { briefingId } = req.params;
            const { content, comment_type = 'internal', parent_id } = req.body;
            console.log('💬 Adding comment to briefing:', briefingId);
            
            if (!content) {
                return res.status(400).json({ success: false, message: 'Comment content is required' });
            }
            
            const { data, error } = await supabase
                .from('briefing_comments')
                .insert([{
                    briefing_id: briefingId,
                    content,
                    comment_type,
                    parent_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }])
                .select()
                .single();
                
            if (error) {
                console.error('❌ Error adding comment:', error);
                throw error;
            }
            
            console.log('✅ Comment added successfully');
            res.status(201).json({ success: true, data });
        } catch (error) {
            console.error('💥 Error in addComment:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new BriefingController();
