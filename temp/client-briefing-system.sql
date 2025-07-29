-- =====================================================
-- SISTEMA DE BRIEFING COMPLETO PARA AGENCIA DE PUBLICIDAD
-- Optimizado para Supabase
-- =====================================================

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS briefing_attachments CASCADE;
DROP TABLE IF EXISTS briefing_comments CASCADE;
DROP TABLE IF EXISTS briefing_status_history CASCADE;
DROP TABLE IF EXISTS company_briefing CASCADE;
DROP TABLE IF EXISTS briefing CASCADE;
DROP TABLE IF EXISTS briefing_template CASCADE;
DROP TABLE IF EXISTS briefing_category CASCADE;

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de Categorías de Servicios
CREATE TABLE briefing_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50), -- Nombre del icono para UI
    color VARCHAR(7), -- Color hexadecimal para UI
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Templates de Briefing
CREATE TABLE briefing_template (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES briefing_category(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE, -- Para URLs amigables
    description TEXT,
    estimated_duration VARCHAR(100), -- Duración estimada del proyecto
    price_range VARCHAR(100), -- Rango de precios
    questions JSONB NOT NULL, -- Estructura de preguntas
    required_fields JSONB DEFAULT '[]'::jsonb, -- Campos obligatorios
    form_settings JSONB DEFAULT '{}'::jsonb, -- Configuraciones del formulario
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Para destacar servicios principales
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla principal de Briefings
CREATE TABLE briefing (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES briefing_template(id) ON DELETE SET NULL,
    
    -- Información del cliente
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    contact_position VARCHAR(100), -- Cargo del contacto
    company_website VARCHAR(255),
    company_size VARCHAR(50), -- Tamaño de la empresa
    industry VARCHAR(100), -- Industria/sector
    
    -- Respuestas y configuración
    responses JSONB NOT NULL DEFAULT '{}'::jsonb,
    form_progress INTEGER DEFAULT 0, -- Progreso del formulario (0-100)
    
    -- Estado y gestión
    status VARCHAR(30) DEFAULT 'draft', -- draft, submitted, in_review, quoted, approved, in_progress, completed, cancelled
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    estimated_budget VARCHAR(100),
    quoted_budget DECIMAL(12,2),
    approved_budget DECIMAL(12,2),
    timeline_estimate VARCHAR(100),
    
    -- URLs y acceso
    public_url VARCHAR(255) UNIQUE,
    access_token VARCHAR(64) UNIQUE, -- Token para acceso sin autenticación
    qr_code_url VARCHAR(500),
    
    -- Fechas importantes
    expires_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadatos
    ip_address INET, -- IP desde donde se envió
    user_agent TEXT, -- Navegador del cliente
    referrer VARCHAR(500), -- De dónde viene el cliente
    utm_source VARCHAR(100), -- Tracking de marketing
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Configuración de notificaciones
    client_notifications BOOLEAN DEFAULT TRUE,
    internal_notifications BOOLEAN DEFAULT TRUE,
    
    -- Notas internas
    internal_notes TEXT,
    client_feedback TEXT,
    
    -- Campos de control
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    assigned_to INTEGER, -- ID del usuario asignado
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación con empresas existentes (si tienes CRM)
CREATE TABLE company_briefing (
    company_id INTEGER, -- Referencias a tu tabla de companies
    briefing_id INTEGER REFERENCES briefing(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'client', -- client, prospect, partner
    PRIMARY KEY (company_id, briefing_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de historial de estados
CREATE TABLE briefing_status_history (
    id SERIAL PRIMARY KEY,
    briefing_id INTEGER REFERENCES briefing(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by INTEGER, -- ID del usuario que hizo el cambio
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de comentarios y notas
CREATE TABLE briefing_comments (
    id SERIAL PRIMARY KEY,
    briefing_id INTEGER REFERENCES briefing(id) ON DELETE CASCADE,
    user_id INTEGER, -- ID del usuario que comentó
    comment_type VARCHAR(20) DEFAULT 'internal', -- internal, client_visible
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    parent_id INTEGER REFERENCES briefing_comments(id), -- Para respuestas anidadas
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de archivos adjuntos
CREATE TABLE briefing_attachments (
    id SERIAL PRIMARY KEY,
    briefing_id INTEGER REFERENCES briefing(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    uploaded_by VARCHAR(20) DEFAULT 'client', -- client, admin
    description TEXT,
    is_processed BOOLEAN DEFAULT FALSE, -- Para archivos que necesitan procesamiento
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

-- Índices principales
CREATE INDEX idx_briefing_template_id ON briefing(template_id);
CREATE INDEX idx_briefing_status ON briefing(status);
CREATE INDEX idx_briefing_priority ON briefing(priority);
CREATE INDEX idx_briefing_public_url ON briefing(public_url);
CREATE INDEX idx_briefing_access_token ON briefing(access_token);
CREATE INDEX idx_briefing_contact_email ON briefing(contact_email);
CREATE INDEX idx_briefing_created_at ON briefing(created_at);
CREATE INDEX idx_briefing_submitted_at ON briefing(submitted_at);
CREATE INDEX idx_briefing_company_name ON briefing(company_name);

-- Índices para templates
CREATE INDEX idx_briefing_template_category ON briefing_template(category_id);
CREATE INDEX idx_briefing_template_slug ON briefing_template(slug);
CREATE INDEX idx_briefing_template_active ON briefing_template(is_active);
CREATE INDEX idx_briefing_template_featured ON briefing_template(is_featured);

-- Índices para categorías
CREATE INDEX idx_briefing_category_active ON briefing_category(is_active);
CREATE INDEX idx_briefing_category_sort ON briefing_category(sort_order);

-- Índices para relaciones
CREATE INDEX idx_briefing_status_history_briefing ON briefing_status_history(briefing_id);
CREATE INDEX idx_briefing_comments_briefing ON briefing_comments(briefing_id);
CREATE INDEX idx_briefing_attachments_briefing ON briefing_attachments(briefing_id);

-- =====================================================
-- FUNCIONES CORREGIDAS CON DELIMITADORES APROPIADOS
-- =====================================================

-- Función para obtener briefings por estado (CORREGIDA)
CREATE OR REPLACE FUNCTION get_briefings_by_status(status_filter VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    company_name VARCHAR,
    contact_name VARCHAR,
    template_name VARCHAR,
    category_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.company_name,
        b.contact_name,
        bt.name as template_name,
        bc.name as category_name,
        b.status,
        b.priority,
        b.created_at
    FROM briefing b
    LEFT JOIN briefing_template bt ON b.template_id = bt.id
    LEFT JOIN briefing_category bc ON bt.category_id = bc.id
    WHERE (status_filter IS NULL OR b.status = status_filter)
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas generales (CORREGIDA)
CREATE OR REPLACE FUNCTION get_briefing_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_briefings', (SELECT COUNT(*) FROM briefing),
        'pending_review', (SELECT COUNT(*) FROM briefing WHERE status = 'submitted'),
        'in_progress', (SELECT COUNT(*) FROM briefing WHERE status IN ('approved', 'in_progress')),
        'completed', (SELECT COUNT(*) FROM briefing WHERE status = 'completed'),
        'this_month', (SELECT COUNT(*) FROM briefing WHERE created_at >= date_trunc('month', NOW())),
        'unread', (SELECT COUNT(*) FROM briefing WHERE is_read = false)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para métricas de conversión por template (CORREGIDA)
CREATE OR REPLACE FUNCTION get_template_conversion_metrics()
RETURNS TABLE (
    template_id INTEGER,
    template_name VARCHAR,
    category_name VARCHAR,
    total_views INTEGER,
    total_submissions INTEGER,
    conversion_rate DECIMAL,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bt.id as template_id,
        bt.name as template_name,
        bc.name as category_name,
        0 as total_views, -- Esto se puede implementar con tracking adicional
        COUNT(b.id)::INTEGER as total_submissions,
        CASE 
            WHEN COUNT(b.id) > 0 THEN 
                (COUNT(CASE WHEN b.status != 'draft' THEN 1 END)::DECIMAL / COUNT(b.id) * 100)
            ELSE 0 
        END as conversion_rate,
        AVG(b.submitted_at - b.created_at) as avg_completion_time
    FROM briefing_template bt
    LEFT JOIN briefing_category bc ON bt.category_id = bc.id
    LEFT JOIN briefing b ON bt.id = b.template_id
    WHERE bt.is_active = true
    GROUP BY bt.id, bt.name, bc.name
    ORDER BY total_submissions DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para análisis de abandono de formularios (CORREGIDA)
CREATE OR REPLACE FUNCTION get_form_abandonment_analysis()
RETURNS TABLE (
    template_id INTEGER,
    template_name VARCHAR,
    started_count INTEGER,
    completed_count INTEGER,
    abandoned_count INTEGER,
    abandonment_rate DECIMAL,
    avg_progress_at_abandonment DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bt.id as template_id,
        bt.name as template_name,
        COUNT(b.id)::INTEGER as started_count,
        COUNT(CASE WHEN b.status != 'draft' THEN 1 END)::INTEGER as completed_count,
        COUNT(CASE WHEN b.status = 'draft' THEN 1 END)::INTEGER as abandoned_count,
        CASE 
            WHEN COUNT(b.id) > 0 THEN 
                (COUNT(CASE WHEN b.status = 'draft' THEN 1 END)::DECIMAL / COUNT(b.id) * 100)
            ELSE 0 
        END as abandonment_rate,
        AVG(CASE WHEN b.status = 'draft' THEN b.form_progress ELSE NULL END) as avg_progress_at_abandonment
    FROM briefing_template bt
    LEFT JOIN briefing b ON bt.id = b.template_id
    WHERE bt.is_active = true
    GROUP BY bt.id, bt.name
    HAVING COUNT(b.id) > 0
    ORDER BY abandonment_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular lead quality score (CORREGIDA)
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(briefing_row briefing)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    response_data JSONB;
BEGIN
    response_data := briefing_row.responses;
    
    -- Puntuación base por completitud del formulario
    score := briefing_row.form_progress;
    
    -- Bonificación por presupuesto alto
    IF briefing_row.estimated_budget ~ '\$[5-9],000|\$[1-9][0-9],000' THEN
        score := score + 20;
    ELSIF briefing_row.estimated_budget ~ '\$[1-4],000' THEN
        score := score + 10;
    END IF;
    
    -- Bonificación por urgencia
    IF briefing_row.priority = 'urgent' THEN
        score := score + 15;
    ELSIF briefing_row.priority = 'high' THEN
        score := score + 10;
    END IF;
    
    -- Bonificación por información de contacto completa
    IF briefing_row.contact_phone IS NOT NULL AND briefing_row.company_website IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Penalización por emails genéricos
    IF briefing_row.contact_email ~ '@gmail\.com|@yahoo\.com|@hotmail\.com' THEN
        score := score - 5;
    END IF;
    
    -- Asegurar que el score esté entre 0 y 100
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar briefings antiguos (CORREGIDA)
CREATE OR REPLACE FUNCTION cleanup_old_draft_briefings()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar drafts de más de 30 días sin actividad
    DELETE FROM briefing 
    WHERE status = 'draft' 
    AND updated_at < NOW() - INTERVAL '30 days'
    AND form_progress < 50;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de la limpieza (solo si hay una tabla de logs disponible)
    -- INSERT INTO briefing_comments (briefing_id, comment_type, content)
    -- SELECT 0, 'internal', 'Limpieza automática: ' || deleted_count || ' briefings eliminados'
    -- WHERE deleted_count > 0;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- =====================================================
-- DATOS INICIALES - CATEGORÍAS
-- =====================================================

INSERT INTO briefing_category (name, description, icon, color, sort_order) VALUES
('Marketing Digital', 'Estrategias de marketing online, redes sociales, SEM, SEO', 'bullhorn', '#3B82F6', 1),
('Diseño Gráfico', 'Identidad corporativa, branding, diseño de materiales', 'palette', '#EF4444', 2),
('Desarrollo Web', 'Sitios web, aplicaciones, e-commerce, sistemas', 'code', '#10B981', 3),
('Publicidad Tradicional', 'Radio, TV, prensa, vallas publicitarias', 'tv', '#F59E0B', 4),
('Producción Audiovisual', 'Videos, fotografía, animaciones, spots', 'video', '#8B5CF6', 5),
('Eventos y Activaciones', 'Organización de eventos, activaciones de marca', 'calendar', '#EC4899', 6),
('Estrategia y Consultoría', 'Consultoría estratégica, investigación de mercado', 'lightbulb', '#06B6D4', 7),
('Relaciones Públicas', 'Gestión de prensa, comunicación corporativa', 'users', '#84CC16', 8);

-- =====================================================
-- TEMPLATES DE BRIEFING DETALLADOS
-- =====================================================

-- Template: Marketing Digital
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    1,
    'Marketing Digital Integral',
    'marketing-digital-integral',
    'Estrategia completa de marketing digital incluyendo redes sociales, SEM, SEO y contenido',
    '2-4 meses',
    '$2,000 - $10,000 USD',
    '[
        {
            "id": "company_overview",
            "type": "section",
            "title": "Información de la Empresa",
            "description": "Necesitamos conocer mejor tu empresa para crear la estrategia perfecta",
            "questions": [
                {
                    "id": "company_description",
                    "type": "textarea",
                    "label": "Describe tu empresa y lo que hacen",
                    "required": true,
                    "placeholder": "Ej: Somos una empresa de tecnología que desarrolla software para...",
                    "validation": {"minLength": 50, "maxLength": 500}
                },
                {
                    "id": "years_in_business",
                    "type": "select",
                    "label": "¿Cuántos años llevan en el mercado?",
                    "required": true,
                    "options": ["Menos de 1 año", "1-3 años", "3-5 años", "5-10 años", "Más de 10 años"]
                },
                {
                    "id": "company_size",
                    "type": "select",
                    "label": "Tamaño de la empresa",
                    "required": true,
                    "options": ["1-10 empleados", "11-50 empleados", "51-200 empleados", "201-500 empleados", "Más de 500 empleados"]
                },
                {
                    "id": "main_products_services",
                    "type": "textarea",
                    "label": "Principales productos o servicios",
                    "required": true,
                    "placeholder": "Describe tus productos/servicios principales"
                },
                {
                    "id": "unique_value_proposition",
                    "type": "textarea",
                    "label": "¿Qué los diferencia de la competencia?",
                    "required": true,
                    "placeholder": "Ej: Somos los únicos que ofrecemos..."
                }
            ]
        },
        {
            "id": "target_audience",
            "type": "section",
            "title": "Público Objetivo",
            "description": "Define a quién quieres llegar con tu marketing",
            "questions": [
                {
                    "id": "primary_audience_demographics",
                    "type": "group",
                    "label": "Audiencia Principal",
                    "questions": [
                        {
                            "id": "age_range",
                            "type": "select",
                            "label": "Rango de edad",
                            "required": true,
                            "options": ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Todas las edades"]
                        },
                        {
                            "id": "gender",
                            "type": "select",
                            "label": "Género",
                            "required": true,
                            "options": ["Masculino", "Femenino", "Ambos", "No binario", "Todos"]
                        },
                        {
                            "id": "income_level",
                            "type": "select",
                            "label": "Nivel de ingresos",
                            "required": false,
                            "options": ["Bajo", "Medio-bajo", "Medio", "Medio-alto", "Alto", "Muy alto"]
                        }
                    ]
                },
                {
                    "id": "geographic_location",
                    "type": "select",
                    "label": "Ubicación geográfica",
                    "required": true,
                    "options": ["Local (ciudad)", "Regional (estado/provincia)", "Nacional", "Internacional", "Global"]
                },
                {
                    "id": "customer_persona",
                    "type": "textarea",
                    "label": "Describe a tu cliente ideal",
                    "required": true,
                    "placeholder": "Ej: María, 32 años, profesional, vive en la ciudad, le gusta..."
                },
                {
                    "id": "customer_pain_points",
                    "type": "textarea",
                    "label": "¿Qué problemas resuelven tus productos/servicios?",
                    "required": true,
                    "placeholder": "Ej: Nuestros clientes necesitan..."
                }
            ]
        },
        {
            "id": "marketing_goals",
            "type": "section",
            "title": "Objetivos de Marketing",
            "description": "Define qué quieres lograr con tu estrategia de marketing",
            "questions": [
                {
                    "id": "primary_goals",
                    "type": "checkbox",
                    "label": "Objetivos principales (selecciona todos los que apliquen)",
                    "required": true,
                    "options": [
                        "Aumentar el reconocimiento de marca",
                        "Generar más leads cualificados",
                        "Incrementar las ventas",
                        "Fidelizar clientes existentes",
                        "Lanzar un nuevo producto/servicio",
                        "Expandirse a nuevos mercados",
                        "Mejorar la reputación online",
                        "Competir mejor con la competencia"
                    ]
                },
                {
                    "id": "success_metrics",
                    "type": "checkbox",
                    "label": "¿Cómo medirán el éxito?",
                    "required": true,
                    "options": [
                        "Aumento en ventas (%)",
                        "Número de leads generados",
                        "Crecimiento en seguidores",
                        "Mejora en engagement",
                        "Tráfico web",
                        "Posicionamiento en buscadores",
                        "Reconocimiento de marca",
                        "ROI de la inversión publicitaria"
                    ]
                },
                {
                    "id": "timeline_urgency",
                    "type": "select",
                    "label": "¿Cuál es la urgencia del proyecto?",
                    "required": true,
                    "options": ["Muy urgente (menos de 1 mes)", "Urgente (1-2 meses)", "Normal (2-4 meses)", "Flexible (más de 4 meses)"]
                }
            ]
        },
        {
            "id": "current_marketing",
            "type": "section",
            "title": "Situación Actual de Marketing",
            "description": "Cuéntanos qué están haciendo actualmente",
            "questions": [
                {
                    "id": "current_digital_presence",
                    "type": "checkbox",
                    "label": "¿Dónde tienen presencia digital actualmente?",
                    "required": false,
                    "options": ["Sitio web", "Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Twitter", "Google My Business", "Ninguna"]
                },
                {
                    "id": "website_performance",
                    "type": "group",
                    "label": "Sobre su sitio web actual",
                    "conditional": {"field": "current_digital_presence", "contains": "Sitio web"},
                    "questions": [
                        {
                            "id": "website_url",
                            "type": "url",
                            "label": "URL del sitio web",
                            "required": false,
                            "placeholder": "https://www.ejemplo.com"
                        },
                        {
                            "id": "website_satisfaction",
                            "type": "scale",
                            "label": "¿Qué tan satisfechos están con su sitio web actual? (1-10)",
                            "required": false,
                            "min": 1,
                            "max": 10
                        }
                    ]
                },
                {
                    "id": "current_marketing_budget",
                    "type": "select",
                    "label": "Presupuesto mensual actual en marketing",
                    "required": true,
                    "options": ["$0", "$1-500", "$501-1,500", "$1,501-3,000", "$3,001-5,000", "$5,001-10,000", "Más de $10,000"]
                },
                {
                    "id": "previous_agencies",
                    "type": "radio",
                    "label": "¿Han trabajado con otras agencias de marketing antes?",
                    "required": true,
                    "options": ["Sí", "No"]
                },
                {
                    "id": "previous_experience",
                    "type": "textarea",
                    "label": "Si han trabajado con otras agencias, ¿qué fue lo que más y menos les gustó?",
                    "required": false,
                    "conditional": {"field": "previous_agencies", "equals": "Sí"},
                    "placeholder": "Cuéntanos sobre tu experiencia previa..."
                }
            ]
        },
        {
            "id": "budget_timeline",
            "type": "section",
            "title": "Presupuesto y Cronograma",
            "description": "Información importante para estructurar la propuesta",
            "questions": [
                {
                    "id": "total_budget_range",
                    "type": "select",
                    "label": "Rango de presupuesto total para el proyecto",
                    "required": true,
                    "options": [
                        "$1,000 - $3,000",
                        "$3,000 - $5,000", 
                        "$5,000 - $10,000",
                        "$10,000 - $20,000",
                        "$20,000 - $50,000",
                        "Más de $50,000",
                        "Necesito una cotización"
                    ]
                },
                {
                    "id": "budget_flexibility",
                    "type": "scale",
                    "label": "¿Qué tan flexible es su presupuesto? (1=Muy estricto, 10=Muy flexible)",
                    "required": true,
                    "min": 1,
                    "max": 10
                },
                {
                    "id": "preferred_start_date",
                    "type": "date",
                    "label": "¿Cuándo les gustaría comenzar?",
                    "required": true
                },
                {
                    "id": "decision_makers",
                    "type": "textarea",
                    "label": "¿Quiénes están involucrados en la toma de decisiones?",
                    "required": true,
                    "placeholder": "Ej: Gerente General, Director de Marketing, etc."
                }
            ]
        },
        {
            "id": "additional_info",
            "type": "section",
            "title": "Información Adicional",
            "description": "Cualquier información extra que nos ayude a entender mejor su proyecto",
            "questions": [
                {
                    "id": "special_requirements",
                    "type": "textarea",
                    "label": "¿Tienen algún requerimiento especial o restricción?",
                    "required": false,
                    "placeholder": "Ej: No podemos usar ciertas plataformas, tenemos fechas importantes..."
                },
                {
                    "id": "inspiration_references",
                    "type": "textarea",
                    "label": "¿Hay alguna marca o campaña que admiren?",
                    "required": false,
                    "placeholder": "Compártenos marcas o campañas que les gusten y por qué"
                },
                {
                    "id": "questions_for_us",
                    "type": "textarea",
                    "label": "¿Tienen alguna pregunta para nosotros?",
                    "required": false,
                    "placeholder": "Cualquier duda sobre nuestro proceso, servicios, etc."
                }
            ]
        }
    ]'::jsonb,
    '["company_description", "years_in_business", "company_size", "main_products_services", "age_range", "gender", "geographic_location", "customer_persona", "primary_goals", "success_metrics", "current_marketing_budget", "total_budget_range", "preferred_start_date", "decision_makers"]'::jsonb
);

-- Template: Diseño Gráfico e Identidad
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    2,
    'Identidad Corporativa y Branding',
    'identidad-corporativa-branding',
    'Desarrollo completo de identidad visual, logo, manual de marca y aplicaciones',
    '4-8 semanas',
    '$1,500 - $8,000 USD',
    '[
        {
            "id": "brand_overview",
            "type": "section",
            "title": "Información de la Marca",
            "questions": [
                {
                    "id": "brand_stage",
                    "type": "select",
                    "label": "¿En qué etapa está su marca?",
                    "required": true,
                    "options": ["Nueva empresa (sin identidad)", "Rediseño completo", "Actualización/modernización", "Extensión de marca existente"]
                },
                {
                    "id": "brand_personality",
                    "type": "checkbox",
                    "label": "¿Cómo quieren que se perciba su marca?",
                    "required": true,
                    "options": ["Profesional", "Moderna", "Confiable", "Innovadora", "Amigable", "Elegante", "Divertida", "Sofisticada", "Accesible", "Premium"]
                },
                {
                    "id": "brand_values",
                    "type": "textarea",
                    "label": "¿Cuáles son los valores principales de su marca?",
                    "required": true,
                    "placeholder": "Ej: Calidad, innovación, servicio al cliente..."
                }
            ]
        },
        {
            "id": "design_preferences",
            "type": "section",
            "title": "Preferencias de Diseño",
            "questions": [
                {
                    "id": "color_preferences",
                    "type": "text",
                    "label": "¿Tienen preferencias de colores?",
                    "required": false,
                    "placeholder": "Ej: Azul corporativo, colores cálidos, evitar el rojo..."
                },
                {
                    "id": "style_direction",
                    "type": "select",
                    "label": "Dirección de estilo preferida",
                    "required": true,
                    "options": ["Minimalista/Limpio", "Moderno/Geométrico", "Clásico/Tradicional", "Orgánico/Natural", "Tecnológico/Futurista", "Artesanal/Hecho a mano"]
                },
                {
                    "id": "logo_type_preference",
                    "type": "select",
                    "label": "Tipo de logo preferido",
                    "required": true,
                    "options": ["Solo texto (tipográfico)", "Solo símbolo/icono", "Combinación texto + símbolo", "No tengo preferencia"]
                }
            ]
        },
        {
            "id": "applications_needed",
            "type": "section",
            "title": "Aplicaciones Requeridas",
            "questions": [
                {
                    "id": "basic_applications",
                    "type": "checkbox",
                    "label": "¿Qué aplicaciones básicas necesitan?",
                    "required": true,
                    "options": ["Tarjetas de presentación", "Papel membretado", "Sobres", "Facturas/Documentos", "Sellos", "Firmas de email"]
                },
                {
                    "id": "marketing_materials",
                    "type": "checkbox",
                    "label": "¿Qué materiales de marketing necesitan?",
                    "required": false,
                    "options": ["Folletos/Brochures", "Banners", "Afiches", "Presentaciones PPT", "Material para redes sociales", "Catálogos"]
                },
                {
                    "id": "digital_applications",
                    "type": "checkbox",
                    "label": "¿Qué aplicaciones digitales necesitan?",
                    "required": false,
                    "options": ["Logo para web", "Favicon", "Perfiles redes sociales", "Email marketing", "App móvil", "Elementos UI/UX"]
                }
            ]
        }
    ]'::jsonb,
    '["brand_stage", "brand_personality", "brand_values", "style_direction", "logo_type_preference", "basic_applications"]'::jsonb
);

-- Template: Desarrollo Web
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    3,
    'Desarrollo Web Completo',
    'desarrollo-web-completo',
    'Sitio web personalizado con diseño responsivo y funcionalidades avanzadas',
    '6-12 semanas',
    '$3,000 - $25,000 USD',
    '[
        {
            "id": "project_type",
            "type": "section",
            "title": "Tipo de Proyecto",
            "questions": [
                {
                    "id": "website_type",
                    "type": "select",
                    "label": "¿Qué tipo de sitio web necesitan?",
                    "required": true,
                    "options": ["Sitio corporativo", "E-commerce", "Blog/Revista", "Portal de noticias", "Aplicación web", "Landing page", "Directorio", "Plataforma educativa"]
                },
                {
                    "id": "main_purpose",
                    "type": "textarea",
                    "label": "¿Cuál es el propósito principal del sitio web?",
                    "required": true,
                    "placeholder": "Ej: Generar ventas online, mostrar portafolio, captar leads..."
                },
                {
                    "id": "target_users",
                    "type": "textarea",
                    "label": "¿Quiénes son los usuarios principales?",
                    "required": true,
                    "placeholder": "Describe a los usuarios que visitarán el sitio"
                }
            ]
        },
        {
            "id": "functionality_requirements",
            "type": "section",
            "title": "Funcionalidades Requeridas",
            "questions": [
                {
                    "id": "core_features",
                    "type": "checkbox",
                    "label": "Funcionalidades básicas necesarias",
                    "required": true,
                    "options": ["Formulario de contacto", "Galería de imágenes", "Blog/Noticias", "Buscador interno", "Mapa de ubicación", "Chat en vivo", "Newsletter", "Testimonios"]
                },
                {
                    "id": "advanced_features",
                    "type": "checkbox",
                    "label": "Funcionalidades avanzadas",
                    "required": false,
                    "options": ["Sistema de usuarios/login", "Panel de administración", "Reservas/Citas online", "Calculadoras", "Integraciones CRM", "API personalizada", "Multiidioma", "Geolocalización"]
                },
                {
                    "id": "ecommerce_features",
                    "type": "checkbox",
                    "label": "Si es e-commerce, ¿qué funcionalidades necesitan?",
                    "required": false,
                    "conditional": {"field": "website_type", "equals": "E-commerce"},
                    "options": ["Catálogo de productos", "Carrito de compras", "Pasarelas de pago", "Gestión de inventario", "Cupones/Descuentos", "Seguimiento de envíos", "Reseñas de productos", "Wishlist"]
                }
            ]
        },
        {
            "id": "technical_specifications",
            "type": "section",
            "title": "Especificaciones Técnicas",
            "questions": [
                {
                    "id": "cms_preference",
                    "type": "select",
                    "label": "¿Prefieren algún CMS específico?",
                    "required": true,
                    "options": ["WordPress", "Custom/Desde cero", "Shopify", "Wix/Squarespace", "No tengo preferencia", "Otro (especificar)"]
                },
                {
                    "id": "hosting_domain",
                    "type": "select",
                    "label": "¿Ya tienen hosting y dominio?",
                    "required": true,
                    "options": ["Sí, ambos", "Solo dominio", "Solo hosting", "Ninguno", "No estoy seguro"]
                },
                {
                    "id": "integrations_needed",
                    "type": "checkbox",
                    "label": "¿Qué integraciones necesitan?",
                    "required": false,
                    "options": ["Google Analytics", "Facebook Pixel", "Mailchimp", "CRM (Salesforce, HubSpot)", "ERP", "Redes sociales", "Sistemas de pago", "APIs externas"]
                }
            ]
        }
    ]'::jsonb,
    '["website_type", "main_purpose", "target_users", "core_features", "cms_preference", "hosting_domain"]'::jsonb
);

-- Template: Producción Audiovisual
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    5,
    'Producción de Video Corporativo',
    'produccion-video-corporativo',
    'Producción completa de video incluyendo concepto, grabación, edición y post-producción',
    '3-6 semanas',
    '$2,500 - $15,000 USD',
    '[
        {
            "id": "video_purpose",
            "type": "section",
            "title": "Propósito del Video",
            "questions": [
                {
                    "id": "video_type",
                    "type": "select",
                    "label": "¿Qué tipo de video necesitan?",
                    "required": true,
                    "options": ["Video corporativo", "Spot publicitario", "Video explicativo/Tutorial", "Testimoniales", "Evento/Conferencia", "Producto showcase", "Video institucional", "Capacitación"]
                },
                {
                    "id": "video_objective",
                    "type": "textarea",
                    "label": "¿Cuál es el objetivo principal del video?",
                    "required": true,
                    "placeholder": "Ej: Presentar la empresa a nuevos clientes, explicar nuestro producto..."
                },
                {
                    "id": "key_message",
                    "type": "textarea",
                    "label": "¿Cuál es el mensaje clave que quieren transmitir?",
                    "required": true,
                    "placeholder": "El mensaje principal que debe recordar la audiencia"
                }
            ]
        },
        {
            "id": "production_details",
            "type": "section",
            "title": "Detalles de Producción",
            "questions": [
                {
                    "id": "video_duration",
                    "type": "select",
                    "label": "Duración aproximada del video",
                    "required": true,
                    "options": ["30 segundos", "1 minuto", "2-3 minutos", "5 minutos", "10+ minutos", "No estoy seguro"]
                },
                {
                    "id": "video_style",
                    "type": "select",
                    "label": "Estilo de video preferido",
                    "required": true,
                    "options": ["Corporativo formal", "Moderno y dinámico", "Documental", "Animado/Motion graphics", "Testimonial natural", "Cinematográfico", "Minimalista"]
                },
                {
                    "id": "filming_locations",
                    "type": "checkbox",
                    "label": "¿Dónde se realizará la grabación?",
                    "required": true,
                    "options": ["Oficinas de la empresa", "Locación externa", "Estudio profesional", "Múltiples locaciones", "Virtual/Online", "Por definir"]
                },
                {
                    "id": "talent_needed",
                    "type": "checkbox",
                    "label": "¿Qué talento necesitan?",
                    "required": false,
                    "options": ["Empleados de la empresa", "Actor profesional", "Locutor/Narrador", "Modelos", "Expertos/Testimoniales", "Solo voz en off"]
                }
            ]
        },
        {
            "id": "technical_requirements",
            "type": "section",
            "title": "Requerimientos Técnicos",
            "questions": [
                {
                    "id": "video_quality",
                    "type": "select",
                    "label": "Calidad de video requerida",
                    "required": true,
                    "options": ["HD (1080p)", "4K", "No tengo preferencia", "La mejor disponible"]
                },
                {
                    "id": "delivery_formats",
                    "type": "checkbox",
                    "label": "¿En qué formatos necesitan el video final?",
                    "required": true,
                    "options": ["Web/Redes sociales", "Presentaciones", "TV/Broadcast", "YouTube", "Instagram/Stories", "LinkedIn", "Email marketing"]
                },
                {
                    "id": "additional_services",
                    "type": "checkbox",
                    "label": "¿Qué servicios adicionales necesitan?",
                    "required": false,
                    "options": ["Subtítulos", "Traducción", "Música original", "Efectos especiales", "Animaciones", "Color grading profesional", "Múltiples versiones"]
                }
            ]
        }
    ]'::jsonb,
    '["video_type", "video_objective", "key_message", "video_duration", "video_style", "filming_locations", "video_quality", "delivery_formats"]'::jsonb
);

-- Template: Eventos y Activaciones
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    6,
    'Organización de Eventos',
    'organizacion-eventos',
    'Planificación y ejecución completa de eventos corporativos y activaciones de marca',
    '4-12 semanas',
    '$5,000 - $50,000 USD',
    '[
        {
            "id": "event_overview",
            "type": "section",
            "title": "Información General del Evento",
            "questions": [
                {
                    "id": "event_type",
                    "type": "select",
                    "label": "¿Qué tipo de evento organizarán?",
                    "required": true,
                    "options": ["Conferencia/Seminario", "Lanzamiento de producto", "Evento corporativo", "Feria/Exposición", "Networking", "Capacitación", "Celebración/Aniversario", "Activación de marca"]
                },
                {
                    "id": "event_objective",
                    "type": "textarea",
                    "label": "¿Cuál es el objetivo principal del evento?",
                    "required": true,
                    "placeholder": "Ej: Lanzar nuestro nuevo producto, fortalecer relaciones con clientes..."
                },
                {
                    "id": "expected_attendees",
                    "type": "select",
                    "label": "¿Cuántos asistentes esperan?",
                    "required": true,
                    "options": ["10-25", "26-50", "51-100", "101-250", "251-500", "500-1000", "Más de 1000"]
                },
                {
                    "id": "target_audience_event",
                    "type": "textarea",
                    "label": "¿Quién es su audiencia objetivo?",
                    "required": true,
                    "placeholder": "Ej: Clientes actuales, prospectos, empleados, medios de comunicación..."
                }
            ]
        },
        {
            "id": "event_logistics",
            "type": "section",
            "title": "Logística del Evento",
            "questions": [
                {
                    "id": "preferred_date",
                    "type": "date",
                    "label": "¿Fecha preferida para el evento?",
                    "required": true
                },
                {
                    "id": "event_duration",
                    "type": "select",
                    "label": "¿Cuánto durará el evento?",
                    "required": true,
                    "options": ["2-3 horas", "Medio día", "Día completo", "2 días", "3+ días"]
                },
                {
                    "id": "venue_preference",
                    "type": "select",
                    "label": "¿Qué tipo de venue prefieren?",
                    "required": true,
                    "options": ["Hotel/Centro de convenciones", "Salón de eventos", "Oficinas propias", "Locación al aire libre", "Restaurante", "Espacio cultural", "Virtual/Online", "Híbrido"]
                },
                {
                    "id": "catering_needed",
                    "type": "select",
                    "label": "¿Necesitan servicio de catering?",
                    "required": true,
                    "options": ["Sí, comida completa", "Solo coffee break", "Solo bebidas", "No", "Por definir"]
                }
            ]
        },
        {
            "id": "event_services",
            "type": "section",
            "title": "Servicios Requeridos",
            "questions": [
                {
                    "id": "technical_requirements",
                    "type": "checkbox",
                    "label": "¿Qué equipos técnicos necesitan?",
                    "required": false,
                    "options": ["Audio/Micrófono", "Proyector/Pantallas", "Iluminación", "Video/Streaming", "Internet/WiFi", "Traducción simultánea", "Grabación del evento"]
                },
                {
                    "id": "promotional_materials",
                    "type": "checkbox",
                    "label": "¿Qué materiales promocionales necesitan?",
                    "required": false,
                    "options": ["Invitaciones", "Banners/Señalética", "Giveaways/Regalos", "Carpetas/Material informativo", "Credenciales", "Stands/Decoración", "Fotografía del evento"]
                },
                {
                    "id": "registration_system",
                    "type": "radio",
                    "label": "¿Necesitan sistema de registro?",
                    "required": true,
                    "options": ["Sí", "No", "Ya lo tenemos"]
                }
            ]
        }
    ]'::jsonb,
    '["event_type", "event_objective", "expected_attendees", "target_audience_event", "preferred_date", "event_duration", "venue_preference", "catering_needed", "registration_system"]'::jsonb
);

-- Template: Estrategia y Consultoría
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    7,
    'Consultoría Estratégica de Marketing',
    'consultoria-estrategica-marketing',
    'Análisis profundo y desarrollo de estrategia integral de marketing y comunicación',
    '3-8 semanas',
    '$3,000 - $20,000 USD',
    '[
        {
            "id": "business_analysis",
            "type": "section",
            "title": "Análisis del Negocio",
            "questions": [
                {
                    "id": "business_challenges",
                    "type": "textarea",
                    "label": "¿Cuáles son los principales desafíos que enfrenta su negocio?",
                    "required": true,
                    "placeholder": "Ej: Competencia fuerte, bajo reconocimiento de marca, dificultad para generar leads..."
                },
                {
                    "id": "growth_stage",
                    "type": "select",
                    "label": "¿En qué etapa de crecimiento se encuentra su empresa?",
                    "required": true,
                    "options": ["Startup/Lanzamiento", "Crecimiento temprano", "Expansión", "Madurez", "Transformación/Reinvención"]
                },
                {
                    "id": "competitive_landscape",
                    "type": "textarea",
                    "label": "¿Quiénes son sus principales competidores?",
                    "required": true,
                    "placeholder": "Mencione 3-5 competidores principales y qué los diferencia"
                },
                {
                    "id": "market_position",
                    "type": "textarea",
                    "label": "¿Cómo se posicionan actualmente en el mercado?",
                    "required": true,
                    "placeholder": "Ej: Somos líderes en calidad pero tenemos precios altos..."
                }
            ]
        },
        {
            "id": "strategic_objectives",
            "type": "section",
            "title": "Objetivos Estratégicos",
            "questions": [
                {
                    "id": "business_goals_1year",
                    "type": "textarea",
                    "label": "¿Cuáles son sus objetivos de negocio para el próximo año?",
                    "required": true,
                    "placeholder": "Ej: Aumentar ventas 40%, expandir a 2 nuevas ciudades..."
                },
                {
                    "id": "business_goals_3years",
                    "type": "textarea",
                    "label": "¿Dónde se ven en 3 años?",
                    "required": true,
                    "placeholder": "Visión a mediano plazo de la empresa"
                },
                {
                    "id": "areas_for_analysis",
                    "type": "checkbox",
                    "label": "¿En qué áreas necesitan análisis y estrategia?",
                    "required": true,
                    "options": ["Posicionamiento de marca", "Estrategia de precios", "Canales de distribución", "Comunicación/Messaging", "Segmentación de mercado", "Análisis de competencia", "Oportunidades de crecimiento", "Optimización de procesos"]
                },
                {
                    "id": "success_metrics_consulting",
                    "type": "textarea",
                    "label": "¿Cómo medirán el éxito de la consultoría?",
                    "required": true,
                    "placeholder": "Ej: Aumento en leads, mejor posicionamiento, claridad estratégica..."
                }
            ]
        },
        {
            "id": "current_strategy",
            "type": "section",
            "title": "Estrategia Actual",
            "questions": [
                {
                    "id": "current_marketing_strategy",
                    "type": "textarea",
                    "label": "Describan su estrategia de marketing actual",
                    "required": true,
                    "placeholder": "¿Qué están haciendo actualmente? ¿Qué funciona y qué no?"
                },
                {
                    "id": "internal_resources",
                    "type": "textarea",
                    "label": "¿Qué recursos internos tienen para marketing?",
                    "required": true,
                    "placeholder": "Ej: Equipo de marketing interno, presupuesto, herramientas..."
                },
                {
                    "id": "data_availability",
                    "type": "checkbox",
                    "label": "¿Qué datos tienen disponibles para el análisis?",
                    "required": false,
                    "options": ["Ventas históricas", "Datos de clientes", "Analytics web", "Investigación de mercado", "Feedback de clientes", "Datos de competencia", "Ninguno", "No estoy seguro"]
                }
            ]
        }
    ]'::jsonb,
    '["business_challenges", "growth_stage", "competitive_landscape", "market_position", "business_goals_1year", "areas_for_analysis", "current_marketing_strategy", "internal_resources"]'::jsonb
);

-- Template: Relaciones Públicas
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    8,
    'Estrategia de Relaciones Públicas',
    'estrategia-relaciones-publicas',
    'Gestión integral de comunicación corporativa y relaciones con medios',
    '2-6 meses',
    '$2,000 - $12,000 USD',
    '[
        {
            "id": "pr_objectives",
            "type": "section",
            "title": "Objetivos de Relaciones Públicas",
            "questions": [
                {
                    "id": "pr_goals",
                    "type": "checkbox",
                    "label": "¿Cuáles son sus objetivos principales?",
                    "required": true,
                    "options": ["Mejorar reputación corporativa", "Gestión de crisis", "Lanzamiento de producto/servicio", "Posicionamiento como expertos", "Aumentar visibilidad mediática", "Mejorar relaciones con stakeholders", "Comunicación interna"]
                },
                {
                    "id": "reputation_status",
                    "type": "select",
                    "label": "¿Cómo calificarían su reputación actual?",
                    "required": true,
                    "options": ["Excelente", "Buena", "Regular", "Mala", "En crisis", "Desconocida"]
                },
                {
                    "id": "pr_challenges",
                    "type": "textarea",
                    "label": "¿Qué desafíos de comunicación enfrentan actualmente?",
                    "required": true,
                    "placeholder": "Ej: Poca visibilidad mediática, crisis reciente, competencia fuerte..."
                }
            ]
        },
        {
            "id": "media_strategy",
            "type": "section",
            "title": "Estrategia de Medios",
            "questions": [
                {
                    "id": "target_media",
                    "type": "checkbox",
                    "label": "¿Qué tipos de medios quieren abordar?",
                    "required": true,
                    "options": ["Prensa escrita", "TV", "Radio", "Medios digitales", "Podcasts", "Influencers", "Redes sociales", "Medios especializados"]
                },
                {
                    "id": "geographic_scope",
                    "type": "select",
                    "label": "¿Cuál es el alcance geográfico deseado?",
                    "required": true,
                    "options": ["Local", "Regional", "Nacional", "Internacional"]
                },
                {
                    "id": "key_messages_pr",
                    "type": "textarea",
                    "label": "¿Cuáles son los mensajes clave que quieren comunicar?",
                    "required": true,
                    "placeholder": "Los 3-5 mensajes principales sobre su empresa/marca"
                },
                {
                    "id": "spokespersons",
                    "type": "textarea",
                    "label": "¿Quiénes pueden actuar como voceros?",
                    "required": true,
                    "placeholder": "Ej: CEO, Director de Marketing, especialistas técnicos..."
                }
            ]
        },
        {
            "id": "content_events",
            "type": "section",
            "title": "Contenido y Eventos",
            "questions": [
                {
                    "id": "newsworthy_content",
                    "type": "textarea",
                    "label": "¿Qué contenido o noticias tienen para compartir?",
                    "required": false,
                    "placeholder": "Ej: Lanzamientos, logros, estudios, eventos, alianzas..."
                },
                {
                    "id": "thought_leadership",
                    "type": "radio",
                    "label": "¿Quieren posicionarse como líderes de opinión en su sector?",
                    "required": true,
                    "options": ["Sí", "No", "No estoy seguro"]
                },
                {
                    "id": "events_participation",
                    "type": "checkbox",
                    "label": "¿En qué tipo de eventos participan o quieren participar?",
                    "required": false,
                    "options": ["Conferencias", "Ferias comerciales", "Networking", "Panels de expertos", "Premios", "Eventos propios", "Ninguno"]
                }
            ]
        }
    ]'::jsonb,
    '["pr_goals", "reputation_status", "pr_challenges", "target_media", "geographic_scope", "key_messages_pr", "spokespersons", "thought_leadership"]'::jsonb
);

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista para resumen de briefings con información de categoría
CREATE VIEW briefing_summary AS
SELECT 
    b.id,
    b.company_name,
    b.contact_name,
    b.contact_email,
    b.status,
    b.priority,
    b.estimated_budget,
    b.quoted_budget,
    bt.name as template_name,
    bc.name as category_name,
    bc.color as category_color,
    b.created_at,
    b.submitted_at,
    b.is_read,
    b.form_progress
FROM briefing b
LEFT JOIN briefing_template bt ON b.template_id = bt.id
LEFT JOIN briefing_category bc ON bt.category_id = bc.id;

-- Vista para estadísticas por categoría
CREATE VIEW category_stats AS
SELECT 
    bc.id,
    bc.name,
    bc.color,
    COUNT(b.id) as total_briefings,
    COUNT(CASE WHEN b.status = 'submitted' THEN 1 END) as submitted_count,
    COUNT(CASE WHEN b.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN b.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_count
FROM briefing_category bc
LEFT JOIN briefing_template bt ON bc.id = bt.category_id
LEFT JOIN briefing b ON bt.id = b.template_id
WHERE bc.is_active = true
GROUP BY bc.id, bc.name, bc.color;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener briefings por estado
CREATE OR REPLACE FUNCTION get_briefings_by_status(status_filter VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    company_name VARCHAR,
    contact_name VARCHAR,
    template_name VARCHAR,
    category_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.company_name,
        b.contact_name,
        bt.name as template_name,
        bc.name as category_name,
        b.status,
        b.priority,
        b.created_at
    FROM briefing b
    LEFT JOIN briefing_template bt ON b.template_id = bt.id
    LEFT JOIN briefing_category bc ON bt.category_id = bc.id
    WHERE (status_filter IS NULL OR b.status = status_filter)
    ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas generales
CREATE OR REPLACE FUNCTION get_briefing_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_briefings', (SELECT COUNT(*) FROM briefing),
        'pending_review', (SELECT COUNT(*) FROM briefing WHERE status = 'submitted'),
        'in_progress', (SELECT COUNT(*) FROM briefing WHERE status IN ('approved', 'in_progress')),
        'completed', (SELECT COUNT(*) FROM briefing WHERE status = 'completed'),
        'this_month', (SELECT COUNT(*) FROM briefing WHERE created_at >= date_trunc('month', NOW())),
        'unread', (SELECT COUNT(*) FROM briefing WHERE is_read = false)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLÍTICAS RLS PARA SUPABASE (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en las tablas principales
ALTER TABLE briefing_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_attachments ENABLE ROW LEVEL SECURITY;

-- Política para acceso público a categorías activas
CREATE POLICY "Public can view active categories" ON briefing_category
    FOR SELECT USING (is_active = true);

-- Política para acceso público a templates activos
CREATE POLICY "Public can view active templates" ON briefing_template
    FOR SELECT USING (is_active = true);

-- Política para que cualquiera pueda crear briefings
CREATE POLICY "Anyone can create briefings" ON briefing
    FOR INSERT WITH CHECK (true);

-- Política para que solo usuarios autenticados vean todos los briefings
CREATE POLICY "Authenticated users can view all briefings" ON briefing
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para acceso público con token
CREATE POLICY "Public can view briefing with valid token" ON briefing
    FOR SELECT USING (access_token IS NOT NULL);

-- Política para updates de briefings
CREATE POLICY "Authenticated users can update briefings" ON briefing
    FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE briefing_category IS 'Categorías de servicios de la agencia (Marketing, Diseño, etc.)';
COMMENT ON TABLE briefing_template IS 'Templates de formularios para cada servicio';
COMMENT ON TABLE briefing IS 'Briefings completados por clientes potenciales';
COMMENT ON TABLE briefing_status_history IS 'Historial de cambios de estado de briefings';
COMMENT ON TABLE briefing_comments IS 'Comentarios y notas sobre briefings';
COMMENT ON TABLE briefing_attachments IS 'Archivos adjuntos a los briefings';

COMMENT ON COLUMN briefing.responses IS 'Respuestas del cliente en formato JSON estructurado';
COMMENT ON COLUMN briefing.public_url IS 'URL única para acceso público al formulario';
COMMENT ON COLUMN briefing.access_token IS 'Token seguro para acceso sin autenticación';
COMMENT ON COLUMN briefing.form_progress IS 'Progreso del formulario (0-100%)';
COMMENT ON COLUMN briefing.utm_source IS 'Fuente de tráfico para tracking de marketing';

-- =====================================================
-- DATOS ADICIONALES DE EJEMPLO
-- =====================================================

-- Insertar más templates especializados
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    4,
    'Campaña Publicitaria Tradicional',
    'campana-publicitaria-tradicional',
    'Desarrollo de campaña para medios tradicionales: TV, Radio, Prensa, Exterior',
    '4-8 semanas',
    '$10,000 - $100,000 USD',
    '[
        {
            "id": "campaign_overview",
            "type": "section",
            "title": "Información General de la Campaña",
            "questions": [
                {
                    "id": "campaign_objective",
                    "type": "select",
                    "label": "¿Cuál es el objetivo principal de la campaña?",
                    "required": true,
                    "options": ["Lanzamiento de producto", "Awareness de marca", "Promoción/Oferta", "Reposicionamiento", "Respuesta directa", "Institucional"]
                },
                {
                    "id": "target_media_traditional",
                    "type": "checkbox",
                    "label": "¿En qué medios quieren aparecer?",
                    "required": true,
                    "options": ["TV", "Radio", "Prensa escrita", "Revistas", "Vallas/Exterior", "Cine", "Transporte público"]
                },
                {
                    "id": "campaign_duration",
                    "type": "select",
                    "label": "¿Cuánto tiempo durará la campaña?",
                    "required": true,
                    "options": ["1-2 semanas", "1 mes", "2-3 meses", "6 meses", "1 año", "Campaña permanente"]
                },
                {
                    "id": "campaign_budget_range",
                    "type": "select",
                    "label": "Rango de presupuesto para medios",
                    "required": true,
                    "options": ["$5,000 - $15,000", "$15,000 - $50,000", "$50,000 - $100,000", "$100,000 - $500,000", "Más de $500,000", "Por definir"]
                }
            ]
        },
        {
            "id": "creative_direction",
            "type": "section",
            "title": "Dirección Creativa",
            "questions": [
                {
                    "id": "creative_concept",
                    "type": "textarea",
                    "label": "¿Tienen algún concepto creativo en mente?",
                    "required": false,
                    "placeholder": "Describe la idea o concepto que tienen para la campaña"
                },
                {
                    "id": "tone_voice",
                    "type": "checkbox",
                    "label": "¿Qué tono/personalidad debe tener la campaña?",
                    "required": true,
                    "options": ["Serio/Profesional", "Divertido/Humor", "Emocional/Inspirador", "Educativo/Informativo", "Urgente/Promocional", "Elegante/Sofisticado", "Familiar/Cercano"]
                },
                {
                    "id": "call_to_action",
                    "type": "textarea",
                    "label": "¿Cuál es la acción que quieren que tome la audiencia?",
                    "required": true,
                    "placeholder": "Ej: Visitar el sitio web, llamar, comprar, visitar tienda..."
                },
                {
                    "id": "creative_restrictions",
                    "type": "textarea",
                    "label": "¿Hay alguna restricción o elemento que NO debe incluirse?",
                    "required": false,
                    "placeholder": "Ej: No usar ciertos colores, evitar ciertas palabras, restricciones legales..."
                }
            ]
        },
        {
            "id": "media_planning",
            "type": "section",
            "title": "Planificación de Medios",
            "questions": [
                {
                    "id": "target_schedule",
                    "type": "checkbox",
                    "label": "¿Cuándo prefieren que salga la campaña?",
                    "required": true,
                    "options": ["Mañana", "Tarde", "Noche", "Fines de semana", "Días laborales", "Horario completo", "Por definir"]
                },
                {
                    "id": "geographic_coverage",
                    "type": "select",
                    "label": "¿Cuál es la cobertura geográfica deseada?",
                    "required": true,
                    "options": ["Local (ciudad)", "Regional (estado)", "Nacional", "Fronterizo", "Por definir"]
                },
                {
                    "id": "competitive_analysis",
                    "type": "textarea",
                    "label": "¿Qué está haciendo la competencia en medios?",
                    "required": false,
                    "placeholder": "Menciona campañas de competidores que hayas notado"
                }
            ]
        }
    ]'::jsonb,
    '["campaign_objective", "target_media_traditional", "campaign_duration", "campaign_budget_range", "tone_voice", "call_to_action", "target_schedule", "geographic_coverage"]'::jsonb
);

-- Template adicional: SEO y Posicionamiento Web
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    1,
    'SEO y Posicionamiento Web',
    'seo-posicionamiento-web',
    'Optimización para motores de búsqueda y mejora del posicionamiento orgánico',
    '3-6 meses',
    '$1,500 - $8,000 USD',
    '[
        {
            "id": "seo_current_situation",
            "type": "section",
            "title": "Situación Actual",
            "questions": [
                {
                    "id": "website_url_seo",
                    "type": "url",
                    "label": "URL de su sitio web",
                    "required": true,
                    "placeholder": "https://www.ejemplo.com"
                },
                {
                    "id": "current_seo_efforts",
                    "type": "select",
                    "label": "¿Han trabajado SEO anteriormente?",
                    "required": true,
                    "options": ["Nunca", "Internamente", "Con otra agencia", "Intentos básicos", "No estoy seguro"]
                },
                {
                    "id": "current_rankings",
                    "type": "textarea",
                    "label": "¿Conocen su posición actual en Google para palabras clave importantes?",
                    "required": false,
                    "placeholder": "Ej: Aparecemos en página 2 para diseño web..."
                },
                {
                    "id": "google_analytics",
                    "type": "radio",
                    "label": "¿Tienen Google Analytics instalado?",
                    "required": true,
                    "options": ["Sí", "No", "No estoy seguro"]
                }
            ]
        },
        {
            "id": "seo_objectives",
            "type": "section",
            "title": "Objetivos SEO",
            "questions": [
                {
                    "id": "target_keywords",
                    "type": "textarea",
                    "label": "¿Para qué palabras clave quieren posicionarse?",
                    "required": true,
                    "placeholder": "Ej: diseño web, desarrollo de sitios, agencia digital..."
                },
                {
                    "id": "seo_goals",
                    "type": "checkbox",
                    "label": "¿Cuáles son sus objetivos principales?",
                    "required": true,
                    "options": ["Aumentar tráfico orgánico", "Mejorar posiciones en Google", "Generar más leads", "Aumentar ventas online", "Competir mejor", "Presencia local", "Autoridad de marca"]
                },
                {
                    "id": "target_locations",
                    "type": "textarea",
                    "label": "¿En qué ubicaciones geográficas quieren aparecer?",
                    "required": true,
                    "placeholder": "Ej: Ciudad de México, todo México, internacional..."
                },
                {
                    "id": "success_timeline",
                    "type": "select",
                    "label": "¿En qué tiempo esperan ver resultados?",
                    "required": true,
                    "options": ["1-3 meses", "3-6 meses", "6-12 meses", "Más de 1 año", "No tengo expectativa específica"]
                }
            ]
        },
        {
            "id": "technical_seo",
            "type": "section",
            "title": "Aspectos Técnicos",
            "questions": [
                {
                    "id": "website_platform",
                    "type": "select",
                    "label": "¿En qué plataforma está construido su sitio?",
                    "required": true,
                    "options": ["WordPress", "Shopify", "Wix", "Squarespace", "Desarrollo personalizado", "Otro", "No estoy seguro"]
                },
                {
                    "id": "mobile_friendly",
                    "type": "radio",
                    "label": "¿Su sitio web es responsive (se ve bien en móviles)?",
                    "required": true,
                    "options": ["Sí", "No", "No estoy seguro"]
                },
                {
                    "id": "site_speed_issues",
                    "type": "radio",
                    "label": "¿Han notado que su sitio carga lento?",
                    "required": true,
                    "options": ["Sí, muy lento", "A veces", "No, carga bien", "No estoy seguro"]
                }
            ]
        }
    ]'::jsonb,
    '["website_url_seo", "current_seo_efforts", "target_keywords", "seo_goals", "target_locations", "success_timeline", "website_platform", "mobile_friendly"]'::jsonb
);

-- Template: Social Media Management
INSERT INTO briefing_template (category_id, name, slug, description, estimated_duration, price_range, questions, required_fields) VALUES
(
    1,
    'Gestión de Redes Sociales',
    'gestion-redes-sociales',
    'Administración completa de redes sociales incluyendo contenido, community management y pauta',
    'Servicio mensual',
    '$800 - $5,000 USD/mes',
    '[
        {
            "id": "social_presence",
            "type": "section",
            "title": "Presencia Actual en Redes",
            "questions": [
                {
                    "id": "current_platforms",
                    "type": "checkbox",
                    "label": "¿En qué redes sociales tienen presencia actualmente?",
                    "required": true,
                    "options": ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Twitter", "Pinterest", "WhatsApp Business", "Ninguna"]
                },
                {
                    "id": "platform_performance",
                    "type": "group",
                    "label": "Rendimiento actual",
                    "questions": [
                        {
                            "id": "followers_count",
                            "type": "select",
                            "label": "¿Cuántos seguidores tienen en total (todas las redes)?",
                            "required": false,
                            "options": ["0-100", "101-500", "501-1,000", "1,001-5,000", "5,001-10,000", "10,001-50,000", "Más de 50,000"]
                        },
                        {
                            "id": "posting_frequency",
                            "type": "select",
                            "label": "¿Con qué frecuencia publican actualmente?",
                            "required": true,
                            "options": ["Nunca", "Ocasionalmente", "1-2 veces por semana", "Diariamente", "Varias veces al día", "Muy irregular"]
                        }
                    ]
                },
                {
                    "id": "content_creation_current",
                    "type": "radio",
                    "label": "¿Quién gestiona sus redes actualmente?",
                    "required": true,
                    "options": ["Nadie específico", "Empleado interno", "Freelancer", "Otra agencia", "El dueño/gerente"]
                }
            ]
        },
        {
            "id": "social_objectives",
            "type": "section",
            "title": "Objetivos en Redes Sociales",
            "questions": [
                {
                    "id": "social_goals",
                    "type": "checkbox",
                    "label": "¿Qué quieren lograr con sus redes sociales?",
                    "required": true,
                    "options": ["Aumentar seguidores", "Generar engagement", "Captar leads", "Aumentar ventas", "Atención al cliente", "Construir comunidad", "Posicionamiento de marca", "Educación/Tips"]
                },
                {
                    "id": "target_platforms_future",
                    "type": "checkbox",
                    "label": "¿En qué plataformas quieren enfocar sus esfuerzos?",
                    "required": true,
                    "options": ["Facebook", "Instagram", "LinkedIn", "YouTube", "TikTok", "Twitter", "Pinterest", "WhatsApp Business"]
                },
                {
                    "id": "content_types_preferred",
                    "type": "checkbox",
                    "label": "¿Qué tipo de contenido les interesa más?",
                    "required": true,
                    "options": ["Fotos de productos", "Videos", "Carousels educativos", "Stories", "Reels/TikToks", "Live streams", "User-generated content", "Behind the scenes"]
                },
                {
                    "id": "brand_voice_social",
                    "type": "select",
                    "label": "¿Qué personalidad debe tener su marca en redes?",
                    "required": true,
                    "options": ["Profesional y seria", "Amigable y cercana", "Divertida y casual", "Experta y educativa", "Inspiracional", "No estoy seguro"]
                }
            ]
        },
        {
            "id": "resources_requirements",
            "type": "section",
            "title": "Recursos y Requerimientos",
            "questions": [
                {
                    "id": "content_creation_needs",
                    "type": "checkbox",
                    "label": "¿Qué servicios necesitan?",
                    "required": true,
                    "options": ["Creación de contenido", "Community management", "Pauta/Ads", "Fotografía de productos", "Videos", "Diseño gráfico", "Copywriting", "Reportes/Analytics"]
                },
                {
                    "id": "posting_frequency_desired",
                    "type": "select",
                    "label": "¿Con qué frecuencia quieren publicar?",
                    "required": true,
                    "options": ["3-4 veces por semana", "1 vez por día", "2-3 veces por día", "Depende de la plataforma", "Lo que recomienden"]
                },
                {
                    "id": "ad_budget_monthly",
                    "type": "select",
                    "label": "¿Cuánto pueden invertir mensualmente en pauta/publicidad?",
                    "required": false,
                    "options": ["$0", "$100-300", "$300-500", "$500-1,000", "$1,000-2,500", "Más de $2,500", "Por definir"]
                },
                {
                    "id": "approval_process",
                    "type": "select",
                    "label": "¿Cómo prefieren el proceso de aprobación de contenido?",
                    "required": true,
                    "options": ["Revisar todo antes de publicar", "Revisar solo contenido importante", "No necesitan aprobación previa", "Revisar semanalmente en lote"]
                }
            ]
        }
    ]'::jsonb,
    '["current_platforms", "posting_frequency", "content_creation_current", "social_goals", "target_platforms_future", "content_types_preferred", "brand_voice_social", "content_creation_needs", "posting_frequency_desired", "approval_process"]'::jsonb
);

-- =====================================================
-- FUNCIONES ADICIONALES PARA ANALYTICS Y REPORTES
-- =====================================================

-- Función para obtener métricas de conversión por template
CREATE OR REPLACE FUNCTION get_template_conversion_metrics()
RETURNS TABLE (
    template_id INTEGER,
    template_name VARCHAR,
    category_name VARCHAR,
    total_views INTEGER,
    total_submissions INTEGER,
    conversion_rate DECIMAL,
    avg_completion_time INTERVAL
) AS $function$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            bt.id as template_id,
            bt.name as template_name,
            bc.name as category_name,
            0 as total_views, -- Esto se puede implementar con tracking adicional
            COUNT(b.id)::INTEGER as total_submissions,
            CASE 
                WHEN COUNT(b.id) > 0 THEN 
                    (COUNT(CASE WHEN b.status != 'draft' THEN 1 END)::DECIMAL / COUNT(b.id) * 100)
                ELSE 0 
            END as conversion_rate,
            AVG(b.submitted_at - b.created_at) as avg_completion_time
        FROM briefing_template bt
        LEFT JOIN briefing_category bc ON bt.category_id = bc.id
        LEFT JOIN briefing b ON bt.id = b.template_id
        WHERE bt.is_active = true
        GROUP BY bt.id, bt.name, bc.name
        ORDER BY total_submissions DESC
    LOOP
        template_id := r.template_id;
        template_name := r.template_name;
        category_name := r.category_name;
        total_views := r.total_views;
        total_submissions := r.total_submissions;
        conversion_rate := r.conversion_rate;
        avg_completion_time := r.avg_completion_time;
        RETURN NEXT;
    END LOOP;
    RETURN;
END;
$function$ LANGUAGE plpgsql;

-- Función para análisis de abandono de formularios
CREATE OR REPLACE FUNCTION get_form_abandonment_analysis()
RETURNS TABLE (
    template_id INTEGER,
    template_name VARCHAR,
    started_count INTEGER,
    completed_count INTEGER,
    abandoned_count INTEGER,
    abandonment_rate DECIMAL,
    avg_progress_at_abandonment DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bt.id as template_id,
        bt.name as template_name,
        COUNT(b.id)::INTEGER as started_count,
        COUNT(CASE WHEN b.status != 'draft' THEN 1 END)::INTEGER as completed_count,
        COUNT(CASE WHEN b.status = 'draft' THEN 1 END)::INTEGER as abandoned_count,
        CASE 
            WHEN COUNT(b.id) > 0 THEN 
                (COUNT(CASE WHEN b.status = 'draft' THEN 1 END)::DECIMAL / COUNT(b.id) * 100)
            ELSE 0 
        END as abandonment_rate,
        AVG(CASE WHEN b.status = 'draft' THEN b.form_progress ELSE NULL END) as avg_progress_at_abandonment
    FROM briefing_template bt
    LEFT JOIN briefing b ON bt.id = b.template_id
    WHERE bt.is_active = true
    GROUP BY bt.id, bt.name
    HAVING COUNT(b.id) > 0
    ORDER BY abandonment_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para reportes de lead quality scoring
CREATE OR REPLACE FUNCTION calculate_lead_quality_score(briefing_row briefing)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    response_data JSONB;
BEGIN
    response_data := briefing_row.responses;
    
    -- Puntuación base por completitud del formulario
    score := briefing_row.form_progress;
    
    -- Bonificación por presupuesto alto
    IF briefing_row.estimated_budget ~ '\$[5-9],000|\$[1-9][0-9],000' THEN
        score := score + 20;
    ELSIF briefing_row.estimated_budget ~ '\$[1-4],000' THEN
        score := score + 10;
    END IF;
    
    -- Bonificación por urgencia
    IF briefing_row.priority = 'urgent' THEN
        score := score + 15;
    ELSIF briefing_row.priority = 'high' THEN
        score := score + 10;
    END IF;
    
    -- Bonificación por información de contacto completa
    IF briefing_row.contact_phone IS NOT NULL AND briefing_row.company_website IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    -- Penalización por emails genéricos
    IF briefing_row.contact_email ~ '@gmail\.com|@yahoo\.com|@hotmail\.com' THEN
        score := score - 5;
    END IF;
    
    -- Asegurar que el score esté entre 0 y 100
    score := GREATEST(0, LEAST(100, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Vista para leads con scoring
CREATE VIEW briefing_with_lead_score AS
SELECT 
    b.*,
    bt.name as template_name,
    bc.name as category_name,
    bc.color as category_color,
    calculate_lead_quality_score(b) as lead_quality_score
FROM briefing b
LEFT JOIN briefing_template bt ON b.template_id = bt.id
LEFT JOIN briefing_category bc ON bt.category_id = bc.id;

-- =====================================================
-- TRIGGERS ADICIONALES PARA AUTOMATIZACIÓN
-- =====================================================

-- Función para notificaciones automáticas
CREATE OR REPLACE FUNCTION get_template_conversion_metrics()
RETURNS TABLE (
    template_id INTEGER,
    template_name VARCHAR,
    category_name VARCHAR,
    total_views INTEGER,
    total_submissions INTEGER,
    conversion_rate DECIMAL,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bt.id::INTEGER AS template_id,
        bt.name::VARCHAR AS template_name,
        bc.name::VARCHAR AS category_name,
        0::INTEGER AS total_views, -- Placeholder para futuras mejoras con tracking
        COUNT(b.id)::INTEGER AS total_submissions,
        CASE
            WHEN COUNT(b.id) > 0 THEN
                (COUNT(CASE WHEN b.status != 'draft' THEN 1 END)::DECIMAL / COUNT(b.id)) * 100
            ELSE 0
        END AS conversion_rate,
        AVG(b.submitted_at - b.created_at) AS avg_completion_time
    FROM briefing_template bt
    LEFT JOIN briefing_category bc ON bt.category_id = bc.id
    LEFT JOIN briefing b ON bt.id = b.template_id
    WHERE bt.is_active = TRUE
    GROUP BY bt.id, bt.name, bc.name
    ORDER BY total_submissions DESC;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER briefing_notifications_trigger
--     BEFORE INSERT OR UPDATE ON briefing
--     FOR EACH ROW
--     EXECUTE FUNCTION handle_briefing_notifications();
-- Nota: El trigger está comentado porque la función handle_briefing_notifications() no está implementada

-- =====================================================
-- CONFIGURACIONES DE MANTENIMIENTO Y LIMPIEZA
-- =====================================================

-- Función para limpiar briefings antiguos no completados
CREATE OR REPLACE FUNCTION cleanup_old_draft_briefings()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Eliminar drafts de más de 30 días sin actividad
    DELETE FROM briefing 
    WHERE status = 'draft' 
    AND updated_at < NOW() - INTERVAL '30 days'
    AND form_progress < 50;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log de la limpieza
    INSERT INTO briefing_comments (briefing_id, comment_type, content)
    SELECT 0, 'internal', 'Limpieza automática: ' || deleted_count || ' briefings eliminados'
    WHERE deleted_count > 0;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- Índices para búsquedas de texto
CREATE INDEX idx_briefing_company_name_trgm ON briefing USING gin(company_name gin_trgm_ops);
CREATE INDEX idx_briefing_contact_name_trgm ON briefing USING gin(contact_name gin_trgm_ops);

-- Índice para responses JSON (requiere extensiones)
-- CREATE INDEX idx_briefing_responses_gin ON briefing USING gin(responses);

-- Índices compuestos para consultas comunes
CREATE INDEX idx_briefing_status_priority_created ON briefing(status, priority, created_at DESC);
CREATE INDEX idx_briefing_template_status ON briefing(template_id, status);
CREATE INDEX idx_briefing_unread_active ON briefing(is_read, is_archived) WHERE is_read = false AND is_archived = false;

-- =====================================================
-- PERMISOS Y ROLES PARA SUPABASE
-- =====================================================

-- Crear roles personalizados si es necesario
-- CREATE ROLE briefing_admin;
-- CREATE ROLE briefing_viewer;

-- Políticas adicionales más granulares
CREATE POLICY "Admins can do everything" ON briefing
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view assigned briefings" ON briefing
    FOR SELECT USING (
        auth.uid()::text = assigned_to::text OR 
        auth.jwt() ->> 'role' IN ('admin', 'manager')
    );

-- =====================================================
-- CONFIGURACIÓN FINAL Y VERIFICACIONES
-- =====================================================

-- Verificar que todas las tablas fueron creadas correctamente
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename LIKE 'briefing%'
ORDER BY tablename;

-- Verificar que los triggers están activos
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table LIKE 'briefing%'
ORDER BY event_object_table, trigger_name;

-- Mensaje de confirmación
SELECT 'Sistema de Briefing para Agencia de Publicidad - Instalación Completada ✅' as status;