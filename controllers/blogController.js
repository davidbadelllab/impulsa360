import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================
// ARTÍCULOS (ARTICLES)
// =====================================================

// Obtener todos los artículos con información completa
export const getArticles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles_with_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un artículo por ID
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('articles_with_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un artículo
export const createArticle = async (req, res) => {
  try {
    console.log('=== CREATE ARTICLE DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Body keys:', Object.keys(req.body));
    
    const {
      title,
      slug,
      excerpt,
      content,
      featured_image_url,
      category_id,
      author_id,
      guest_author_id,
      read_time_minutes,
      status,
      is_trending,
      is_featured,
      is_published,
      published_at,
      meta_title,
      meta_description,
      seo_keywords
    } = req.body;

    console.log('Extracted fields:');
    console.log({ title, slug, excerpt, content: content?.length || 0, featured_image_url: featured_image_url?.length || 0 });
    console.log({ category_id, author_id, guest_author_id, read_time_minutes, status });
    console.log({ is_trending, is_featured, is_published, published_at });
    console.log({ meta_title, meta_description, seo_keywords });

    // Basic validation - remove undefined values that could cause DB issues
    const insertData = {
      title: title || null,
      slug: slug || null,
      excerpt: excerpt || null,
      content: content || null,
      featured_image_url: featured_image_url || null,
      category_id: category_id || null,
      author_id: author_id || null,
      guest_author_id: guest_author_id || null,
      read_time_minutes: read_time_minutes || null,
      status: status || 'draft',
      is_trending: Boolean(is_trending),
      is_featured: Boolean(is_featured),
      is_published: Boolean(is_published),
      published_at: published_at || null,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
      seo_keywords: seo_keywords || null
    };

    // Validate required fields
    if (!insertData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!insertData.content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    console.log('About to insert to Supabase:');
    console.log('Insert data keys:', Object.keys(insertData));
    console.log('Insert data size (JSON):', JSON.stringify(insertData).length, 'bytes');

    const { data, error } = await supabase
      .from('articles')
      .insert([insertData])
      .select();

    if (error) {
      console.error('Supabase error details:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Article created successfully:', data[0]?.id);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('=== CREATE ARTICLE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message, details: error.details || null });
  }
};

// Actualizar un artículo
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un artículo
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Artículo eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// CATEGORÍAS (CATEGORIES)
// =====================================================

// Obtener todas las categorías
export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una categoría
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, color, icon } = req.body;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, slug, description, color, icon }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// ETIQUETAS (TAGS)
// =====================================================

// Obtener todas las etiquetas
export const getTags = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear una etiqueta
export const createTag = async (req, res) => {
  try {
    const { name, slug, color } = req.body;
    
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name, slug, color }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// AUTORES (AUTHORS)
// =====================================================

// Obtener todos los autores
export const getAuthors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// REACCIONES (LIKES)
// =====================================================

// Dar like a un artículo
export const likeArticle = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { user_email, reaction_type = 'like' } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    const { data, error } = await supabase
      .from('reactions')
      .upsert([
        {
          article_id,
          user_email,
          reaction_type,
          ip_address,
          user_agent
        }
      ])
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Quitar like de un artículo
export const unlikeArticle = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { user_email } = req.body;

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('article_id', article_id)
      .eq('user_email', user_email);

    if (error) throw error;

    res.json({ message: 'Reacción eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// COMENTARIOS (COMMENTS)
// =====================================================

// Obtener comentarios de un artículo
export const getComments = async (req, res) => {
  try {
    const { article_id } = req.params;
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', article_id)
      .eq('is_approved', true)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un comentario
export const createComment = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { author_name, author_email, content, parent_id } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        article_id,
        author_name,
        author_email,
        content,
        parent_id,
        ip_address,
        user_agent
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// COMPARTIDOS (SHARES)
// =====================================================

// Registrar compartido
export const shareArticle = async (req, res) => {
  try {
    const { article_id } = req.params;
    const { platform, user_email } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    const { data, error } = await supabase
      .from('shares')
      .insert([{
        article_id,
        platform,
        user_email,
        ip_address,
        user_agent
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================================================
// ESTADÍSTICAS
// =====================================================

// Obtener estadísticas del blog
export const getBlogStats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('article_stats')
      .select('*')
      .order('total_views', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
