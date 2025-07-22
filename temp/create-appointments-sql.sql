-- Crear tabla appointments en Supabase
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(20),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type VARCHAR(20) DEFAULT 'video' CHECK (type IN ('video', 'phone', 'presencial')),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos datos de ejemplo
INSERT INTO appointments (name, email, company, phone, date, time, type, message, status) VALUES
('Juan Pérez', 'juan@example.com', 'Empresa Test', '+58 412 123 4567', '2024-12-20', '10:00', 'video', 'Cita de prueba', 'pending'),
('María González', 'maria@impulsa360.com', 'Impulsa360', '+58 424 987 6543', '2024-12-21', '14:30', 'presencial', 'Reunión para discutir nueva campaña', 'confirmed'),
('Carlos Rodríguez', 'carlos@techcompany.com', 'TechCompany', '+58 414 555 1234', '2024-12-22', '09:00', 'video', 'Consulta sobre servicios digitales', 'pending'),
('Ana Torres', 'ana@marketing.com', 'Marketing Solutions', '+58 426 777 8888', '2024-12-23', '16:00', 'phone', 'Seguimiento de proyecto', 'completed');

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_email ON appointments(email); 