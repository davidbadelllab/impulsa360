import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Eye,
  ArrowLeft,
  Image,
  Calendar,
  Tag,
  User,
  Globe,
  FileText,
  Settings,
  Upload,
  X
} from 'lucide-react';

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  category_id: string;
  author_id: string;
  status: 'draft' | 'published' | 'scheduled';
  is_featured: boolean;
  is_trending: boolean;
  published_at: string;
  meta_title: string;
  meta_description: string;
  seo_keywords: string;
  tags: string[];
}

const BlogCreateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('content');

  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    author_id: '',
    status: 'draft',
    is_featured: false,
    is_trending: false,
    published_at: '',
    meta_title: '',
    meta_description: '',
    seo_keywords: '',
    tags: []
  });

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [authors, setAuthors] = useState<{id: string, name: string}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);

  // API base URL with proper environment variable handling
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const [availableTags] = useState([
    'Marketing', 'Digital', 'SEO', 'Seguridad', 'Tecnología', 'IA', 'E-commerce', 'Innovación'
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories and authors
  useEffect(() => {
    const fetchCategoriesAndAuthors = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/blog/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          console.log('Categories fetched:', categoriesData);
          setCategories(categoriesData);
          // Set default category if creating new article and no category is set
          if (!isEdit && categoriesData.length > 0 && !formData.category_id) {
            setFormData(prev => ({
              ...prev,
              category_id: categoriesData[0].id
            }));
          }
        }
        setCategoriesLoading(false);

        // Fetch authors
        const authorsResponse = await fetch(`${API_BASE_URL}/api/blog/authors`);
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          console.log('Authors fetched:', authorsData);
          setAuthors(authorsData);
          // Set default author if creating new article and no author is set
          if (!isEdit && authorsData.length > 0 && !formData.author_id) {
            setFormData(prev => ({
              ...prev,
              author_id: authorsData[0].id
            }));
          }
        }
        setAuthorsLoading(false);
      } catch (error) {
        console.error('Error fetching categories and authors:', error);
        setCategoriesLoading(false);
        setAuthorsLoading(false);
      }
    };

    fetchCategoriesAndAuthors();
  }, [isEdit]); // Remove formData dependencies to avoid infinite loop

  useEffect(() => {
    if (isEdit && id) {
      const fetchArticle = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/blog/articles/${id}`);
          if (response.ok) {
            const articleData = await response.json();
            console.log('Article data loaded for editing:', articleData);
            
            // Convert tags array to string if needed
            const tagsArray = Array.isArray(articleData.tags) ? articleData.tags : [];
            
            setFormData({
              title: articleData.title || '',
              slug: articleData.slug || '',
              excerpt: articleData.excerpt || '',
              content: articleData.content || '',
              featured_image_url: articleData.featured_image_url || '',
              category_id: articleData.category_id || '',
              author_id: articleData.author_id || '',
              status: articleData.status || 'draft',
              is_featured: Boolean(articleData.is_featured),
              is_trending: Boolean(articleData.is_trending),
              published_at: articleData.published_at ? new Date(articleData.published_at).toISOString().slice(0, 16) : '',
              meta_title: articleData.meta_title || '',
              meta_description: articleData.meta_description || '',
              seo_keywords: Array.isArray(articleData.seo_keywords) 
                ? articleData.seo_keywords.join(', ') 
                : (articleData.seo_keywords || ''),
              tags: tagsArray
            });
            
            // Set image preview if there's a featured image
            if (articleData.featured_image_url) {
              setImagePreview(articleData.featured_image_url);
            }
          } else {
            console.error('Error loading article:', response.statusText);
            setError('Error al cargar el artículo');
          }
        } catch (error) {
          console.error('Error fetching article:', error);
          setError('Error al cargar el artículo');
        }
      };
      
      fetchArticle();
    }
  }, [isEdit, id, API_BASE_URL]);

  const handleInputChange = (field: keyof ArticleForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    if (!isEdit || !formData.slug) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handleTagAdd = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
    }
  };

  const handleTagRemove = (tag: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen no puede exceder 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setImagePreview(base64String);
        handleInputChange('featured_image_url', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Transform seo_keywords from string to array
      const seoKeywordsArray = formData.seo_keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);

      const dataToSave = {
        ...formData,
        seo_keywords: seoKeywordsArray, // Send as array, not string
        status,
        published_at: status === 'published' ? new Date().toISOString() : formData.published_at
      };
      
      console.log('Data to save:', dataToSave); // Debug log
      
      const url = isEdit ? `${API_BASE_URL}/api/blog/articles/${id}` : `${API_BASE_URL}/api/blog/articles`;
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Article saved:', result);
      
      // Redirigir al listado
      navigate('/dashboard/blog');
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar el artículo');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // Abrir preview en nueva pestaña
    window.open('/blog/preview', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/blog')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Editar Artículo' : 'Crear Artículo'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Modifica el contenido de tu artículo' : 'Crea un nuevo artículo para tu blog'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye size={16} />
              Vista Previa
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
              ) : (
                <FileText size={16} />
              )}
              Guardar Borrador
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save size={16} />
              )}
              Publicar
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'content', label: 'Contenido', icon: FileText },
                  { id: 'seo', label: 'SEO', icon: Globe },
                  { id: 'settings', label: 'Configuración', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Artículo *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Ej: Guía completa de marketing digital para 2024"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 text-sm">/blog/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ml-1"
                      placeholder="guia-marketing-digital-2024"
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen Destacada
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.featured_image_url || imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview || formData.featured_image_url}
                          alt="Featured"
                          className="max-h-48 mx-auto rounded"
                        />
                        <button
                          onClick={() => {
                            handleInputChange('featured_image_url', '');
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          <button 
                            type="button"
                            onClick={() => document.getElementById('image-upload')?.click()}
                            className="text-blue-600 hover:text-blue-500"
                          >
                            Subir imagen
                          </button>
                          <p className="text-gray-500 text-sm mt-1">
                            o arrastra y suelta aquí (máx. 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracto
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Descubre las estrategias más efectivas para impulsar tu negocio en el mundo digital con esta guía completa paso a paso."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/160 caracteres recomendados
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido del Artículo *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="# Mi Artículo\n\nEscribe aquí el contenido de tu artículo usando **Markdown**. \n\n## Subtítulo\n\nPuedes usar listas:\n- Elemento 1\n- Elemento 2\n\nY enlaces: [texto del enlace](https://ejemplo.com)"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Título
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Marketing Digital 2024: Guía Completa y Actualizada"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.meta_title.length}/60 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Descripción
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Aprende las mejores estrategias de marketing digital para 2024. Guía paso a paso con herramientas, técnicas y consejos de expertos."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.meta_description.length}/160 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palabras Clave SEO
                  </label>
                  <input
                    type="text"
                    value={formData.seo_keywords}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="marketing digital, SEO, estrategias online, publicidad digital"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separa las palabras clave con comas (sin coma al final). Ej: marketing, SEO, digital
                  </p>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Autor
                  </label>
                  <select
                    value={formData.author_id}
                    onChange={(e) => handleInputChange('author_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un autor</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiquetas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.filter(tag => !formData.tags.includes(tag)).map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagAdd(tag)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Artículo destacado
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="trending"
                      checked={formData.is_trending}
                      onChange={(e) => handleInputChange('is_trending', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="trending" className="ml-2 block text-sm text-gray-900">
                      Artículo en tendencia
                    </label>
                  </div>
                </div>

                {formData.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Publicación
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.published_at}
                      onChange={(e) => handleInputChange('published_at', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Estado</h3>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Programado</option>
              </select>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Estadísticas</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Palabras:</span>
                  <span>{formData.content.split(' ').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caracteres:</span>
                  <span>{formData.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo de lectura:</span>
                  <span>{Math.ceil(formData.content.split(' ').length / 200)} min</span>
                </div>
              </div>
            </div>

            {/* SEO Score */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">SEO Score</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">60/100 - Mejorable</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCreateEdit;
