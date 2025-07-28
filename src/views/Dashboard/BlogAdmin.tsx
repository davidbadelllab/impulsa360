import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  User,
  TrendingUp,
  Star,
  MoreVertical,
  Loader2
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  author_name?: string;
  category_name?: string;
  created_at: string;
  views?: number;
  is_featured: boolean;
  is_trending: boolean;
  content?: string;
  slug?: string;
}

const BlogAdmin = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch articles from API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog/articles');
        
        if (!response.ok) {
          throw new Error('Error al cargar los artículos');
        }
        
        const data = await response.json();
        
        // Transform API data to match our interface
        const transformedArticles = data.map((article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || '',
          status: article.status || 'draft',
          author_name: article.author_name || 'Autor desconocido',
          category_name: article.category_name || 'Sin categoría',
          created_at: article.created_at,
          views: article.total_views || 0,
          is_featured: article.is_featured || false,
          is_trending: article.is_trending || false,
          content: article.content,
          slug: article.slug
        }));
        
        setArticles(transformedArticles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
      try {
        const response = await fetch(`/api/blog/articles/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setArticles(articles.filter(article => article.id !== id));
        } else {
          throw new Error('Error al eliminar el artículo');
        }
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.author_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando artículos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar los artículos</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Blog</h1>
            <p className="text-gray-600 mt-1">Administra y publica contenido para tu blog</p>
          </div>
          <Link
            to="/dashboard/blog/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Crear Artículo
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Artículos</p>
                <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-green-600">
                  {articles.filter(a => a.status === 'published').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {articles.filter(a => a.status === 'draft').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Edit className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vistas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar artículos por título o autor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="published">Publicados</option>
                <option value="draft">Borradores</option>
                <option value="scheduled">Programados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  Artículo
                </th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Autor
                </th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Categoría
                </th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Fecha
                </th>
                <th className="px-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Vistas
                </th>
                <th className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {article.title}
                          </p>
                          {article.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                          {article.is_trending && (
                            <TrendingUp className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {article.excerpt}
                        </p>
                        {/* Show mobile info */}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 md:hidden">
                          <span>{article.author_name}</span>
                          <span>{new Date(article.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(article.status)}`}>
                      {getStatusText(article.status)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{article.author_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{article.category_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(article.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                    <span className="text-sm text-gray-900">
                      {(article.views || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <Link
                        to={`/dashboard/blog/view/${article.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded transition-colors duration-150"
                        title="Ver artículo"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/dashboard/blog/edit/${article.id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded transition-colors duration-150"
                        title="Editar artículo"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded transition-colors duration-150"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron artículos</h3>
              <p className="text-gray-500 mb-4">Intenta ajustar los filtros de búsqueda</p>
              <Link
                to="/dashboard/blog/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Crear primer artículo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAdmin;

