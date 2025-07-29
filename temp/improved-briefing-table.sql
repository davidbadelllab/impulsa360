-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS CompanyBriefing CASCADE;
DROP TABLE IF EXISTS Briefing CASCADE;

-- Crear tabla Briefing mejorada
CREATE TABLE Briefing (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- Diseño, Programación, Marketing, etc.
    category VARCHAR(50), -- Sistemas, Backend, Frontend, etc.
    title VARCHAR(255), -- Título del proyecto
    description TEXT, -- Descripción detallada del proyecto
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL, -- Empresa asociada
    priority VARCHAR(20) DEFAULT 'medium', -- Prioridad: low, medium, high
    due_date TIMESTAMPTZ, -- Fecha de entrega
    status VARCHAR(20) DEFAULT 'pending', -- Estado: pending, in_progress, completed, cancelled
    is_read BOOLEAN DEFAULT FALSE, -- Si ha sido leído
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de relación CompanyBriefing
CREATE TABLE CompanyBriefing (
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    briefing_id INT REFERENCES Briefing(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, briefing_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_briefing_company_id ON Briefing(company_id);
CREATE INDEX idx_briefing_status ON Briefing(status);
CREATE INDEX idx_briefing_priority ON Briefing(priority);
CREATE INDEX idx_briefing_type ON Briefing(type);
CREATE INDEX idx_briefing_created_at ON Briefing(created_at);
CREATE INDEX idx_briefing_due_date ON Briefing(due_date);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_briefing_updated_at 
    BEFORE UPDATE ON Briefing 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de prueba
INSERT INTO Briefing (type, category, title, description, priority, status) 
VALUES 
    ('Diseño', 'Branding', 'Rediseño de logo corporativo', 'Crear nuevo logo moderno para empresa tecnológica', 'high', 'pending'),
    ('Programación', 'Frontend', 'Sitio web responsive', 'Desarrollar sitio web con React y TypeScript', 'medium', 'in_progress'),
    ('Marketing', 'Redes Sociales', 'Campaña Q1 2024', 'Campaña de marketing digital para redes sociales', 'low', 'completed'),
    ('Consultoría', 'SEO', 'Optimización SEO', 'Mejorar posicionamiento en buscadores', 'high', 'pending'),
    ('Programación', 'Backend', 'API REST', 'Desarrollar API para aplicación móvil', 'medium', 'in_progress')
ON CONFLICT DO NOTHING;

-- Comentarios sobre la estructura
COMMENT ON TABLE Briefing IS 'Tabla principal para almacenar briefings de proyectos';
COMMENT ON COLUMN Briefing.type IS 'Tipo de proyecto: Diseño, Programación, Marketing, Consultoría, etc.';
COMMENT ON COLUMN Briefing.category IS 'Categoría específica: Branding, Frontend, Backend, SEO, etc.';
COMMENT ON COLUMN Briefing.title IS 'Título descriptivo del proyecto';
COMMENT ON COLUMN Briefing.description IS 'Descripción detallada de requerimientos y objetivos';
COMMENT ON COLUMN Briefing.priority IS 'Nivel de prioridad: low, medium, high';
COMMENT ON COLUMN Briefing.status IS 'Estado del proyecto: pending, in_progress, completed, cancelled';
COMMENT ON COLUMN Briefing.is_read IS 'Indica si el briefing ha sido leído por el equipo'; 