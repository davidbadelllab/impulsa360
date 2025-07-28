import express from 'express';
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
  getTags,
  getAuthors,
  likeArticle,
  unlikeArticle,
  getComments,
  createComment,
  shareArticle,
  getBlogStats
} from '../controllers/blogController.js';

const router = express.Router();

// Rutas del blog
router.get('/articles', getArticles);
router.get('/articles/:id', getArticleById);
router.post('/articles', createArticle);
router.put('/articles/:id', updateArticle);
router.delete('/articles/:id', deleteArticle);

// Categorías
router.get('/categories', getCategories);

// Etiquetas
router.get('/tags', getTags);

// Autores
router.get('/authors', getAuthors);

// Likes
router.post('/articles/:article_id/like', likeArticle);
router.delete('/articles/:article_id/unlike', unlikeArticle);

// Comentarios
router.get('/articles/:article_id/comments', getComments);
router.post('/articles/:article_id/comments', createComment);

// Compartidos
router.post('/articles/:article_id/share', shareArticle);

// Estadísticas
router.get('/stats', getBlogStats);

export default router;
