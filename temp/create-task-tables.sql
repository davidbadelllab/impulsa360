-- Script para crear las tablas del sistema de tareas (Trello-like)
-- Ejecutar en Supabase SQL Editor

-- Tabla de tableros (boards)
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  created_by INTEGER REFERENCES users(id),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de listas (lists)
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas (labels)
CREATE TABLE IF NOT EXISTS labels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#0079bf',
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tarjetas (cards)
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  list_id INTEGER REFERENCES lists(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  due_date DATE,
  is_archived BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaciones de tarjetas (card_assignments)
CREATE TABLE IF NOT EXISTS card_assignments (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas de tarjetas (card_labels)
CREATE TABLE IF NOT EXISTS card_labels (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de comentarios (comments)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de checklists (checklists)
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de checklist (checklist_items)
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de archivos adjuntos (attachments)
CREATE TABLE IF NOT EXISTS attachments (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  url TEXT,
  card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_boards_company_id ON boards(company_id);
CREATE INDEX IF NOT EXISTS idx_boards_created_by ON boards(created_by);
CREATE INDEX IF NOT EXISTS idx_lists_board_id ON lists(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_list_id ON cards(list_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);
CREATE INDEX IF NOT EXISTS idx_card_assignments_card_id ON card_assignments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_assignments_user_id ON card_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_card_id ON card_labels(card_id);
CREATE INDEX IF NOT EXISTS idx_card_labels_label_id ON card_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_comments_card_id ON comments(card_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_card_id ON checklists(card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_attachments_card_id ON attachments(card_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para updated_at
CREATE TRIGGER update_boards_updated_at 
  BEFORE UPDATE ON boards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lists_updated_at 
  BEFORE UPDATE ON lists 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at 
  BEFORE UPDATE ON cards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_assignments_updated_at 
  BEFORE UPDATE ON card_assignments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_labels_updated_at 
  BEFORE UPDATE ON card_labels 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at 
  BEFORE UPDATE ON checklists 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at 
  BEFORE UPDATE ON checklist_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at 
  BEFORE UPDATE ON attachments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verificar si existen usuarios antes de insertar datos de ejemplo
DO $$
DECLARE
  user_count INTEGER;
  first_user_id INTEGER;
BEGIN
  -- Contar usuarios existentes
  SELECT COUNT(*) INTO user_count FROM users;
  
  IF user_count > 0 THEN
    -- Obtener el ID del primer usuario
    SELECT id INTO first_user_id FROM users ORDER BY id LIMIT 1;
    
    -- Insertar algunos datos de ejemplo usando el primer usuario existente
    INSERT INTO boards (name, description, created_by) VALUES
    ('Proyecto Demo', 'Tablero de ejemplo para demostrar el sistema de tareas', first_user_id),
    ('Marketing Digital', 'Gestión de campañas y estrategias de marketing', first_user_id);
    
    -- Insertar listas por defecto para el primer tablero
    INSERT INTO lists (name, board_id, position) VALUES
    ('Pendiente', 1, 0),
    ('En Progreso', 1, 1),
    ('Revisión', 1, 2),
    ('Terminado', 1, 3);
    
    -- Insertar algunas etiquetas por defecto
    INSERT INTO labels (name, color, board_id) VALUES
    ('Urgente', '#ff0000', 1),
    ('Importante', '#ff8800', 1),
    ('Normal', '#0079bf', 1),
    ('Baja Prioridad', '#61bd4f', 1);
    
    -- Insertar algunas tarjetas de ejemplo
    INSERT INTO cards (title, description, list_id, position, created_by) VALUES
    ('Configurar entorno de desarrollo', 'Instalar todas las dependencias necesarias para el proyecto', 1, 0, first_user_id),
    ('Diseñar interfaz de usuario', 'Crear mockups y wireframes para la aplicación', 1, 1, first_user_id),
    ('Implementar autenticación', 'Configurar sistema de login y registro de usuarios', 2, 0, first_user_id),
    ('Pruebas unitarias', 'Escribir y ejecutar pruebas para los componentes principales', 3, 0, first_user_id);
    
    RAISE NOTICE 'Datos de ejemplo insertados usando el usuario con ID: %', first_user_id;
  ELSE
    RAISE NOTICE 'No hay usuarios en la base de datos. Solo se crearon las tablas sin datos de ejemplo.';
  END IF;
END $$;

-- Mensaje de confirmación
SELECT 'Tablas del sistema de tareas creadas exitosamente' as mensaje; 