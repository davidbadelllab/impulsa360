import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Share2,
  Heart,
  MessageCircle,
  TrendingUp,
  Star,
  Globe,
  Clock,
  Loader2
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  status: 'draft' | 'published' | 'scheduled';
  author_name: string;
  author_email: string;
  author_position: string;
  category_name: string;
  category_color: string;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  views?: number;
}

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/articles/${id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el artículo');
        }
        
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          navigate('/dashboard/blog');
        } else {
          throw new Error('Error al eliminar el artículo');
        }
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'scheduled': return 'Programado';
      default: return status;
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown to HTML conversion for display
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar el artículo</h3>
          <p className="text-red-600 mt-1">{error || 'Artículo no encontrado'}</p>
          <button 
            onClick={() => navigate('/dashboard/blog')}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Vista de Artículo</h1>
              <p className="text-gray-600">Previsualización del contenido</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/dashboard/blog/edit/${article.id}`}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Edit size={16} />
              Editar
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              {/* Status and Badges */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(article.status)}`}>
                  {getStatusText(article.status)}
                </span>
                {article.is_featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full border border-yellow-200">
                    <Star size={14} className="fill-current" />
                    Destacado
                  </span>
                )}
                {article.is_trending && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full border border-red-200">
                    <TrendingUp size={14} />
                    Trending
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>{article.author_name}</span>
                  {article.author_position && (
                    <span className="text-gray-400">• {article.author_position}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date(article.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span 
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{ backgroundColor: article.category_color }}
                  >
                    {article.category_name}
                  </span>
                </div>
                {article.views && (
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{article.views.toLocaleString()} vistas</span>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              {article.excerpt && (
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
                  <p className="text-lg text-gray-700 italic">
                    {article.excerpt}
                  </p>
                </div>
              )}

              {/* Featured Image */}
              {article.featured_image_url && (
                <div className="mb-6">
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div 
                className="prose max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="mb-4">${formatContent(article.content)}</p>` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="space-y-6">
            {/* Article Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Artículo</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{article.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slug:</span>
                  <span className="text-blue-600">/{article.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creado:</span>
                  <span>{new Date(article.created_at).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actualizado:</span>
                  <span>{new Date(article.updated_at).toLocaleDateString('es-ES')}</span>
                </div>
                {article.published_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publicado:</span>
                    <span>{new Date(article.published_at).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Info */}
            {(article.meta_title || article.meta_description) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">SEO</h3>
                <div className="space-y-3 text-sm">
                  {article.meta_title && (
                    <div>
                      <span className="text-gray-600 block mb-1">Meta Título:</span>
                      <p className="text-gray-900">{article.meta_title}</p>
                    </div>
                  )}
                  {article.meta_description && (
                    <div>
                      <span className="text-gray-600 block mb-1">Meta Descripción:</span>
                      <p className="text-gray-900">{article.meta_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Author Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Autor</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {article.author_name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{article.author_name}</p>
                  {article.author_position && (
                    <p className="text-sm text-gray-600">{article.author_position}</p>
                  )}
                  {article.author_email && (
                    <p className="text-sm text-blue-600">{article.author_email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Acciones</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Share2 size={16} />
                  Compartir
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Globe size={16} />
                  Ver en sitio web
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Clock size={16} />
                  Historial de cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
