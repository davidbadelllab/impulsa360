-- =====================================================
-- ESTRUCTURA DE BASE DE DATOS PARA BLOG - SUPABASE
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (SI EXISTEN)
-- =====================================================

-- Eliminar vistas primero
DROP VIEW IF EXISTS article_stats CASCADE;
DROP VIEW IF EXISTS articles_with_details CASCADE;

-- Eliminar triggers primero (solo si las tablas existen)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
        DROP TRIGGER IF EXISTS trigger_update_articles_updated_at ON articles;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON comments;
        DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
        DROP TRIGGER IF EXISTS trigger_update_reaction_count ON reactions;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shares') THEN
        DROP TRIGGER IF EXISTS trigger_update_share_count ON shares;
    END IF;
END $$;

-- Eliminar funciones
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_article_counters() CASCADE;

-- Eliminar tablas en orden correcto (dependencias)
DROP TABLE IF EXISTS article_views CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- =====================================================
-- TABLA DE CATEGORIAS
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE ETIQUETAS
-- =====================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE AUTORES/INVITADOS
-- =====================================================
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    position VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    is_guest BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA PRINCIPAL DE ARTICULOS
-- =====================================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT,
    featured_image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    guest_author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    read_time_minutes INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_trending BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    seo_keywords TEXT[],
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE RELACION ARTICULOS-ETIQUETAS
-- =====================================================
CREATE TABLE article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, tag_id)
);

-- =====================================================
-- TABLA DE COMENTARIOS
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    author_avatar_url TEXT,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT false,
    is_spam BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE REACCIONES (LIKES)
-- =====================================================
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    reaction_type VARCHAR(20) DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, user_email)
);

-- =====================================================
-- TABLA DE COMPARTIDOS
-- =====================================================
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE SUSCRIPCIONES AL NEWSLETTER
-- =====================================================
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    subscription_source VARCHAR(50) DEFAULT 'blog_popup',
    ip_address INET,
    user_agent TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA DE VISTAS DE ARTICULOS (ANALYTICS)
-- =====================================================
CREATE TABLE article_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    session_id VARCHAR(255),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDICES PARA OPTIMIZACION
-- =====================================================

-- Indices para articulos
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_is_trending ON articles(is_trending);
CREATE INDEX IF NOT EXISTS idx_articles_is_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_title_trgm ON articles USING gin(title gin_trgm_ops);

-- Indices para comentarios
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Indices para reacciones
CREATE INDEX IF NOT EXISTS idx_reactions_article_id ON reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_email ON reactions(user_email);

-- Indices para compartidos
CREATE INDEX IF NOT EXISTS idx_shares_article_id ON shares(article_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);

-- Indices para vistas
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Funcion para actualizar contadores automaticamente
CREATE OR REPLACE FUNCTION update_article_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE articles 
            SET comment_count = comment_count + 1 
            WHERE id = NEW.article_id;
        END IF;
        
        IF TG_TABLE_NAME = 'reactions' THEN
            UPDATE articles 
            SET like_count = like_count + 1 
            WHERE id = NEW.article_id;
        END IF;
        
        IF TG_TABLE_NAME = 'shares' THEN
            UPDATE articles 
            SET share_count = share_count + 1 
            WHERE id = NEW.article_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'comments' THEN
            UPDATE articles 
            SET comment_count = comment_count - 1 
            WHERE id = OLD.article_id;
        END IF;
        
        IF TG_TABLE_NAME = 'reactions' THEN
            UPDATE articles 
            SET like_count = like_count - 1 
            WHERE id = OLD.article_id;
        END IF;
        
        IF TG_TABLE_NAME = 'shares' THEN
            UPDATE articles 
            SET share_count = share_count - 1 
            WHERE id = OLD.article_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar categorias (solo si no existen)
INSERT INTO categories (name, slug, description, color, icon) VALUES
('Marketing Digital', 'marketing-digital', 'Estrategias y tecnicas de marketing digital', '#3B82F6', 'trending-up'),
('Tecnologia', 'tecnologia', 'Innovaciones y tendencias tecnologicas', '#8B5CF6', 'zap'),
('SEO', 'seo', 'Optimizacion para motores de busqueda', '#10B981', 'search'),
('Ciberseguridad', 'ciberseguridad', 'Seguridad digital y proteccion de datos', '#EF4444', 'shield'),
('E-commerce', 'e-commerce', 'Comercio electronico y ventas online', '#F59E0B', 'shopping-cart')
ON CONFLICT (name) DO NOTHING;

-- Insertar etiquetas (solo si no existen)
INSERT INTO tags (name, slug, color) VALUES
('Marketing', 'marketing', '#3B82F6'),
('Tendencias', 'tendencias', '#8B5CF6'),
('Digital', 'digital', '#10B981'),
('Seguridad', 'seguridad', '#EF4444'),
('Empresas', 'empresas', '#F59E0B'),
('IA', 'ia', '#EC4899'),
('E-commerce', 'e-commerce', '#06B6D4'),
('Innovacion', 'innovacion', '#84CC16'),
('Estrategia', 'estrategia', '#F97316')
ON CONFLICT (name) DO NOTHING;

-- Insertar autores (solo si no existen)
INSERT INTO authors (name, email, position, bio, avatar_url, is_guest) VALUES
('Luis Chavez', 'luis.chavez@impulsa360.com', 'Head of Digital Marketing', 'Experto en estrategias de marketing digital con mas de 8 anos de experiencia', '/img/luis chavez.jpg', false),
('Pedro Sanchez', 'pedro.sanchez@impulsa360.com', 'SEO Strategist', 'Especialista en SEO y optimizacion de motores de busqueda', '/img/luis chavez.jpg', false),
('David Badell', 'david.badell@impulsa360.com', 'CEO & Founder', 'Fundador de Impulsa360 y experto en transformacion digital', '/img/profile.jpeg', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- TRIGGERS (DESPUES DE CREAR LAS TABLAS Y DATOS)
-- =====================================================

-- Triggers para actualizar contadores
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_article_counters();

CREATE TRIGGER trigger_update_reaction_count
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW EXECUTE FUNCTION update_article_counters();

CREATE TRIGGER trigger_update_share_count
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_article_counters();

-- Triggers para updated_at
CREATE TRIGGER trigger_update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLITICAS DE SEGURIDAD RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- Eliminar politicas existentes si las hay (solo si las tablas existen)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        DROP POLICY IF EXISTS "Public read access" ON categories;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags') THEN
        DROP POLICY IF EXISTS "Public read access" ON tags;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'authors') THEN
        DROP POLICY IF EXISTS "Public read access" ON authors;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
        DROP POLICY IF EXISTS "Public read access" ON articles;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'article_tags') THEN
        DROP POLICY IF EXISTS "Public read access" ON article_tags;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        DROP POLICY IF EXISTS "Public read access" ON comments;
        DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
        DROP POLICY IF EXISTS "Public read access" ON reactions;
        DROP POLICY IF EXISTS "Authenticated users can insert reactions" ON reactions;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shares') THEN
        DROP POLICY IF EXISTS "Public read access" ON shares;
        DROP POLICY IF EXISTS "Authenticated users can insert shares" ON shares;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscriptions') THEN
        DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscriptions;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'article_views') THEN
        DROP POLICY IF EXISTS "Anyone can track views" ON article_views;
    END IF;
END $$;

-- Politicas para lectura publica
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON authors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON articles FOR SELECT USING (is_published = true);
CREATE POLICY "Public read access" ON article_tags FOR SELECT USING (true);

-- Politicas para comentarios (lectura publica, escritura autenticada)
CREATE POLICY "Public read access" ON comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Politicas para reacciones (lectura publica, escritura autenticada)
CREATE POLICY "Public read access" ON reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reactions" ON reactions FOR INSERT WITH CHECK (true);

-- Politicas para compartidos (lectura publica, escritura autenticada)
CREATE POLICY "Public read access" ON shares FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shares" ON shares FOR INSERT WITH CHECK (true);

-- Politicas para newsletter (solo insercion)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);

-- Politicas para vistas (solo insercion)
CREATE POLICY "Anyone can track views" ON article_views FOR INSERT WITH CHECK (true);

-- =====================================================
-- VISTAS UTILES
-- =====================================================

-- Vista para articulos con informacion completa
CREATE VIEW articles_with_details AS
SELECT 
    a.*,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    au.name as author_name,
    au.position as author_position,
    au.avatar_url as author_avatar,
    ga.name as guest_author_name,
    ga.position as guest_author_position,
    ga.avatar_url as guest_author_avatar,
    array_agg(DISTINCT t.name) as tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN authors au ON a.author_id = au.id
LEFT JOIN authors ga ON a.guest_author_id = ga.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE a.is_published = true
GROUP BY a.id, c.name, c.slug, c.color, au.name, au.position, au.avatar_url, ga.name, ga.position, ga.avatar_url;

-- Vista para estadisticas de articulos
CREATE VIEW article_stats AS
SELECT 
    a.id,
    a.title,
    a.view_count,
    a.like_count,
    a.comment_count,
    a.share_count,
    COUNT(DISTINCT av.id) as total_views,
    COUNT(DISTINCT r.id) as total_reactions,
    COUNT(DISTINCT s.id) as total_shares
FROM articles a
LEFT JOIN article_views av ON a.id = av.article_id
LEFT JOIN reactions r ON a.id = r.article_id
LEFT JOIN shares s ON a.id = s.article_id
WHERE a.is_published = true
GROUP BY a.id, a.title, a.view_count, a.like_count, a.comment_count, a.share_count; 