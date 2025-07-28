import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, Heart, MessageCircle, Send } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/blog/articles/${id}`);

        if (!response.ok) {
          throw new Error('Error loading the article');
        }

        const data = await response.json();
        setArticle(data);
        // Initialize like count with a random number for demo
        setLikeCount(Math.floor(Math.random() * 50) + 10);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching the article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [API_BASE_URL, id]);

  const formatContent = (content) => {
    // Simple content formatting
    return content
      .split('\n\n')
      .map((paragraph, index) => (
        <p key={index} className={`mb-6 leading-relaxed text-lg ${
          theme === 'dark' ? 'text-white' : 'text-gray-700'
        }`}>
          {paragraph.replace(/\n/g, ' ')}
        </p>
      ));
  };

  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleAddComment = () => {
    if (newComment.trim() && newCommentAuthor.trim()) {
      const comment = {
        id: Date.now(),
        author: newCommentAuthor,
        content: newComment,
        timestamp: new Date()
      };
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setNewCommentAuthor('');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-b from-gray-50 via-gray-100 to-blue-100'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950' 
          : 'bg-gradient-to-b from-gray-50 via-gray-100 to-blue-100'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Error al cargar el artículo</h2>
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>{error}</p>
          <Link 
            to="/blog" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-950 via-gray-900 to-blue-950' 
        : 'bg-gradient-to-b from-gray-50 via-gray-100 to-blue-100'
    }`}>
      {/* Navigation */}
      <nav className={`shadow-sm border-b fixed top-16 left-0 right-0 z-10 ${
        theme === 'dark' 
          ? 'bg-gray-900/90 border-gray-800' 
          : 'bg-white/90 border-gray-200'
      } backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            to="/blog" 
            className={`inline-flex items-center transition-colors ${
              theme === 'dark' 
                ? 'text-gray-300 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al blog
          </Link>
        </div>
      </nav>

      {article && (
        <article className="max-w-4xl mx-auto px-4 py-8 mt-16">
          {/* Article Header */}
          <header className="mb-8">
            {/* Category Badge */}
            {article.category_name && (
              <div className="mb-4">
                <span 
                  className="inline-block px-3 py-1 text-sm font-semibold text-white rounded-full"
                  style={{ backgroundColor: article.category_color || '#3B82F6' }}
                >
                  {article.category_name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className={`text-4xl md:text-5xl font-bold leading-tight mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className={`text-xl leading-relaxed mb-6 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {article.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className={`flex flex-wrap items-center gap-6 text-sm mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {article.author_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(article.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {article.content && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{estimateReadTime(article.content)} min de lectura</span>
                </div>
              )}
            </div>

            {/* Share Button */}
            <div className={`flex items-center gap-4 pb-8 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL copiada al portapapeles');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </button>
            </div>
          </header>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="mb-8">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className={`rounded-lg shadow-sm p-8 mb-8 ${
            theme === 'dark' 
              ? 'bg-gray-900/90 border border-gray-800' 
              : 'bg-white'
          }`}>
            <div className={`prose prose-lg max-w-none ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {article.content && formatContent(article.content)}
            </div>
          </div>

          {/* Tags */}
          {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className={`rounded-lg shadow-sm p-6 mb-8 ${
              theme === 'dark' 
                ? 'bg-gray-900/90 border border-gray-800' 
                : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <Tag className="h-5 w-5" />
                Etiquetas
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Section */}
          <div className={`rounded-lg shadow-sm p-6 ${
            theme === 'dark' 
              ? 'bg-gray-900/90 border border-gray-800' 
              : 'bg-white'
          }`}>
            {/* Author Info */}
            <div className={`flex items-center gap-4 mb-6 pb-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                D
              </div>
              <div>
                <h4 className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>David Badell</h4>
              </div>
            </div>

            {/* Likes and Share */}
            <div className="flex items-center gap-6 mb-6">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isLiked 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : (theme === 'dark' 
                        ? 'text-gray-300 hover:text-red-400 hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-red-600 hover:bg-gray-100'
                      )
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount} Me gusta</span>
              </button>
              
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: article.title,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('URL copiada al portapapeles');
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <Share2 className="h-5 w-5" />
                Compartir
              </button>
            </div>

            {/* Comments Section */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                <MessageCircle className="h-5 w-5" />
                Comentarios ({comments.length})
              </h3>
              
              {/* Add Comment Form */}
              <div className={`mb-6 p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={newCommentAuthor}
                    onChange={(e) => setNewCommentAuthor(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    placeholder="Escribe tu comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !newCommentAuthor.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                  Enviar comentario
                </button>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {comment.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>{comment.author}</p>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {comment.timestamp.toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>No hay comentarios aún. ¡Sé el primero en comentar!</p>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  );
};

export default BlogDetail;

