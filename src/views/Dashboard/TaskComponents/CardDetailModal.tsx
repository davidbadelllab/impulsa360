import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { X, Calendar, MessageSquare, Users, Tag, Sparkles, Zap, Eye, Edit3, Save, XCircle, Send, Cpu, Wifi, Battery, Signal } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Label } from '../../../components/ui/label';
import api from '../../../lib/api';

interface Card {
  id: number;
  title: string;
  description?: string;
  list_id: number;
  position: number;
  due_date?: string;
  is_archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  labels: CardLabel[];
  assignments: CardAssignment[];
  comments: Comment[];
  checklists: Checklist[];
  attachments: Attachment[];
}

interface Label {
  id: number;
  name: string;
  color: string;
  board_id: number;
}

interface CardLabel {
  label: Label;
}

interface CardAssignment {
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface Comment {
  id: number;
  content: string;
  card_id: number;
  user_id: number;
  created_at: string;
  user: {
    username: string;
    email: string;
  };
}

interface Checklist {
  id: number;
  title: string;
  card_id: number;
  position: number;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: number;
  title: string;
  is_completed: boolean;
  checklist_id: number;
  position: number;
}

interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  card_id: number;
  uploaded_by: number;
}

interface CardDetailModalProps {
  card: Card;
  boardLabels: Label[];
  onUpdate: () => void;
  onClose: () => void;
}

// Componente de partículas flotantes
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
          initial={{
            x: Math.random() * 800,
            y: Math.random() * 600,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 800,
            y: Math.random() * 600,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Componente de scanner holográfico
const HolographicScanner = () => {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{
          y: [0, 400, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

export default function CardDetailModal({ card, onUpdate, onClose }: CardDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedDescription, setEditedDescription] = useState(card.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const controls = useAnimation();

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();

  useEffect(() => {
    // Animación de entrada épica
    controls.start({
      scale: [0.8, 1.05, 1],
      rotateY: [90, 0],
      opacity: [0, 1],
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    });
  }, [controls]);

  const handleSaveCard = async () => {
    setIsLoading(true);
    setShowScanner(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Efecto dramático
      
      const response = await api.put(`/tasks/cards/${card.id}`, {
        title: editedTitle,
        description: editedDescription
      });

      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating card:', error);
    } finally {
      setIsLoading(false);
      setShowScanner(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    
    try {
      const response = await api.post('/tasks/comments', {
        content: newComment,
        card_id: card.id
      });

      setNewComment('');
      onUpdate();
      // Efecto de éxito
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3 }
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAiMode = () => {
    setAiMode(!aiMode);
    controls.start({
      rotateX: [0, 360],
      transition: { duration: 0.8 }
    });
  };

  return (
    <motion.div
      animate={controls}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        className="relative w-full max-w-4xl max-h-[95vh] overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Fondo futurista con efectos de cristal */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20" />
        
        {/* Efectos de luz neón */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent rounded-3xl" />
        
        {/* Partículas flotantes */}
        <FloatingParticles />
        
        {/* Scanner holográfico */}
        {showScanner && <HolographicScanner />}
        
        {/* Contenido principal */}
        <div className="relative z-10 p-8 h-full overflow-y-auto">
          {/* Header futurista */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <div className="flex items-center space-x-2 text-cyan-400 text-sm">
                <Wifi className="w-4 h-4" />
                <Signal className="w-4 h-4" />
                <Battery className="w-4 h-4" />
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleAiMode}
                className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Zap className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Título con efecto holográfico */}
          <motion.div
            className="mb-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isEditing ? (
              <motion.div
                className="space-y-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-2xl font-bold bg-white/5 border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  placeholder="Título de la tarjeta..."
                />
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={handleSaveCard}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Cancelar</span>
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-between">
                <motion.h1
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {card.title}
                </motion.h1>
                
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit3 className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Etiquetas con efectos neón */}
          {card.labels && card.labels.length > 0 && (
            <motion.div
              className="mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Tag className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {card.labels.map((cardLabel, index) => (
                  <motion.div
                    key={cardLabel.label.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative"
                  >
                    <Badge
                      className="px-3 py-1 text-sm font-medium text-white border-0 shadow-lg"
                      style={{
                        backgroundColor: cardLabel.label.color,
                        boxShadow: `0 0 20px ${cardLabel.label.color}40`,
                      }}
                    >
                      {cardLabel.label.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Descripción con efecto de escritura */}
          <motion.div
            className="mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-medium">Descripción</span>
              </div>
              {!isEditing && (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  Editar
                </motion.button>
              )}
            </div>
            
            {isEditing ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Describe tu tarea..."
                  rows={4}
                  className="bg-white/5 border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                />
              </motion.div>
            ) : (
              <div className="bg-white/5 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-gray-300 leading-relaxed">
                  {card.description || 'Sin descripción'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Información meta con iconos animados */}
          <motion.div
            className="grid grid-cols-2 gap-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {card.due_date && (
              <motion.div
                className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </motion.div>
                <div>
                  <p className="text-xs text-gray-400">Fecha límite</p>
                  <p className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                    {new Date(card.due_date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )}

            {card.assignments && card.assignments.length > 0 && (
              <motion.div
                className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg border border-cyan-500/20 backdrop-blur-sm"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-xs text-gray-400">Asignados</p>
                  <div className="flex -space-x-2 mt-1">
                    {card.assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment.user.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <Avatar className="w-8 h-8 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs">
                            {assignment.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sección de comentarios futurista */}
          <motion.div
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">Comentarios</span>
              <motion.div
                className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {card.comments?.length || 0}
              </motion.div>
            </div>

            {/* Agregar comentario */}
            <motion.div
              className="space-y-4"
              whileHover={{ scale: 1.01 }}
            >
              <div className="relative">
                <Textarea
                  ref={commentRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario épico..."
                  rows={3}
                  className="bg-white/5 border-cyan-500/30 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none pr-12"
                />
                <motion.button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Lista de comentarios */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              <AnimatePresence>
                {card.comments && card.comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-cyan-500/20 rounded-lg p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                      >
                        <Avatar className="w-8 h-8 border border-cyan-400 shadow-lg shadow-cyan-400/20">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-cyan-400">{comment.user?.username || 'Usuario desconocido'}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          <motion.div
                            className="w-2 h-2 bg-green-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [1, 0.5, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
} 