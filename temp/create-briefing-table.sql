-- Crear tabla briefing si no existe
CREATE TABLE IF NOT EXISTS briefing (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id INTEGER REFERENCES companies(id),
    priority VARCHAR(50) DEFAULT 'medium',
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_briefing_company_id ON briefing(company_id);
CREATE INDEX IF NOT EXISTS idx_briefing_status ON briefing(status);
CREATE INDEX IF NOT EXISTS idx_briefing_created_at ON briefing(created_at);

-- Insertar datos de prueba
INSERT INTO briefing (type, category, title, description, priority, status) 
VALUES 
    ('Proyecto', 'Desarrollo', 'Nuevo sitio web', 'Crear sitio web para empresa cliente', 'high', 'pending'),
    ('Reunión', 'Planificación', 'Revisión mensual', 'Revisar objetivos del mes', 'medium', 'completed'),
    ('Tarea', 'Marketing', 'Campaña redes sociales', 'Diseñar campaña para Q1', 'low', 'pending')
ON CONFLICT DO NOTHING; 