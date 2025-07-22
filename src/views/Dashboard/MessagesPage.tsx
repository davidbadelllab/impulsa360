import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Paperclip, 
  Smile,
  User,
  Users,
  MessageSquare,
  Clock,
  Check,
  CheckCheck,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import EmojiPicker from '../../components/EmojiPicker';
import FileUpload from '../../components/FileUpload';
import { useAuth } from '../../context/AuthContext';

interface Conversation {
  id: number;
  name: string;
  type: 'direct' | 'group' | 'team' | 'support';
  participants: number[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: string;
  avatar?: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'audio';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isRead: boolean;
  attachments?: string[];
}

interface MessageStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  unreadMessages: number;
  todayMessages: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  role: string;
}

export default function MessagesPage() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<MessageStats>({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    unreadMessages: 0,
    todayMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showUsers, setShowUsers] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Obtener el ID real del usuario autenticado
  const currentUserId = currentUser?.id || 1;
  const [isWindowActive, setIsWindowActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const conversationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchStats();
    fetchUsers();
    
    // Configurar polling para conversaciones
    setupConversationPolling();
    
    // Configurar listeners para visibilidad de ventana
    setupWindowFocusListeners();
    
    // Cleanup al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (conversationIntervalRef.current) {
        clearInterval(conversationIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      // Enviar que ya no está escribiendo al salir
      if (isTyping) {
        sendTypingStatus(false);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id, true); // Hacer scroll al seleccionar conversación
      markAsRead(selectedConversation.id);
      
      // Configurar polling para mensajes de la conversación actual
      setupMessagePolling(selectedConversation.id);
    } else {
      // Limpiar polling de mensajes si no hay conversación seleccionada
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configurar listeners para visibilidad de ventana
  const setupWindowFocusListeners = () => {
    const handleFocus = () => {
      setIsWindowActive(true);
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, false); // No hacer scroll automático al volver a la ventana
      }
      fetchConversations();
    };

    const handleBlur = () => {
      setIsWindowActive(false);
    };

    const handleVisibilityChange = () => {
      setIsWindowActive(!document.hidden);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // Configurar polling para conversaciones
  const setupConversationPolling = () => {
    if (conversationIntervalRef.current) {
      clearInterval(conversationIntervalRef.current);
    }

    conversationIntervalRef.current = setInterval(() => {
      if (isWindowActive) {
        fetchConversations();
        fetchStats();
      }
    }, 5000); // Cada 5 segundos
  };

  // Configurar polling para mensajes
  const setupMessagePolling = (conversationId: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (isWindowActive && selectedConversation?.id === conversationId) {
        fetchMessages(conversationId, false); // No hacer scroll automático en polling
        fetchTypingUsers(); // Obtener usuarios que están escribiendo
      }
    }, 2000); // Cada 2 segundos para mensajes
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de margen
      setIsScrolledToBottom(isAtBottom);
      
      if (isAtBottom) {
        setHasNewMessages(false);
      }
    }
  };

  const scrollToBottomAndClearNotification = () => {
    scrollToBottom();
    setHasNewMessages(false);
  };

  // Funciones para manejar el estado de "escribiendo"
  const sendTypingStatus = async (typing: boolean) => {
    if (!selectedConversation) return;
    
    try {
      await fetch('http://localhost:3000/api/messages/typing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          userId: currentUserId,
          typing
        })
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
      
      // Configurar intervalo para mantener el estado de typing
      typingIntervalRef.current = setInterval(() => {
        sendTypingStatus(true);
      }, 1000); // Enviar cada segundo
    }
    
    // Reiniciar el timeout para parar de escribir
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 2000); // Parar después de 2 segundos sin escribir
  };

  const handleTypingStop = () => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(false);
      
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const fetchTypingUsers = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/messages/typing/${selectedConversation.id}?userId=${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setTypingUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/conversations?userId=${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number, shouldScroll: boolean = true) => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/conversations/${conversationId}/messages`);
      const result = await response.json();
      
      if (result.success) {
        const newMessages = result.data;
        
        // Solo actualizar si hay cambios
        setMessages(prevMessages => {
          if (JSON.stringify(prevMessages) !== JSON.stringify(newMessages)) {
            const hasNewMsg = newMessages.length > prevMessages.length;
            
            // Si hay mensajes nuevos y el usuario no está en el fondo, mostrar indicador
            if (hasNewMsg && !isScrolledToBottom && !shouldScroll) {
              setHasNewMessages(true);
            }
            
            // Hacer scroll si es necesario
            if (shouldScroll || isScrolledToBottom) {
              setTimeout(() => scrollToBottom(), 100);
              setHasNewMessages(false);
            }
            
            return newMessages;
          }
          return prevMessages;
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/stats?userId=${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/messages/users?currentUserId=${currentUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const startConversation = async (targetUserId: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/messages/conversations/direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId,
          targetUserId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSelectedConversation(result.data);
        setShowUsers(false);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setFileUploadOpen(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await fetch('http://localhost:3000/api/messages/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: currentUserId,
          content: newMessage.trim(),
          type: 'text'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setNewMessage('');
        handleTypingStop(); // Parar el indicador de typing al enviar mensaje
        fetchMessages(selectedConversation.id, true); // Hacer scroll al enviar mensaje
        fetchConversations(); // Actualizar lista de conversaciones
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: number) => {
    try {
      await fetch(`http://localhost:3000/api/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId })
      });
      
      fetchConversations(); // Actualizar contadores
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/messages/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId })
      });

      const result = await response.json();
      
      if (result.success && selectedConversation) {
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'direct': return <User size={16} />;
      case 'group': return <Users size={16} />;
      case 'team': return <Users size={16} />;
      case 'support': return <MessageSquare size={16} />;
      default: return <User size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check size={12} />;
      case 'delivered': return <CheckCheck size={12} />;
      case 'read': return <CheckCheck size={12} className="text-blue-500" />;
      default: return <Clock size={12} />;
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getUserStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'away': return 'Ausente';
      case 'offline': return 'Desconectado';
      default: return 'Desconocido';
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header con estadísticas */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mensajes</h1>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageSquare size={14} />
            {stats.totalConversations} conversaciones
          </Badge>
          <Badge variant="destructive" className="flex items-center gap-1">
            {stats.unreadMessages} no leídos
          </Badge>
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Sidebar de conversaciones */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Barra de búsqueda */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de conversaciones y usuarios */}
          <div className="flex-1 overflow-y-auto">
            {/* Botón para mostrar usuarios */}
            <div className="p-4 border-b border-gray-200">
              <Button
                onClick={() => setShowUsers(!showUsers)}
                variant="outline"
                className="w-full justify-start"
              >
                <Plus size={16} className="mr-2" />
                {showUsers ? 'Ocultar usuarios' : 'Mostrar usuarios'}
              </Button>
            </div>

            {showUsers ? (
              // Lista de usuarios
              <div>
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Usuarios disponibles</h3>
                </div>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startConversation(user.id)}
                    className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getUserStatusColor(user.status)}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">{user.name}</h3>
                        </div>
                        <p className="text-xs text-gray-500">{getUserStatusText(user.status)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                             // Lista de conversaciones
               filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getConversationIcon(conversation.type)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header del chat */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedConversation.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getConversationIcon(selectedConversation.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-500">
                        {typingUsers.length > 0 ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <div className="flex gap-0.5">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            está escribiendo...
                          </span>
                        ) : selectedConversation.type === 'direct' ? 'En línea' : `${selectedConversation.participants.length} participantes`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative"
                onScroll={handleScroll}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${message.senderId === currentUserId ? 'order-2' : 'order-1'}`}>
                      {message.senderId !== currentUserId && (
                        <p className="text-xs text-gray-500 mb-1">{message.senderName}</p>
                      )}
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUserId && getStatusIcon(message.status)}
                        </div>
                      </div>
                      {message.senderId === currentUserId && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            onClick={() => deleteMessage(message.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Indicador de "escribiendo" */}
                {typingUsers.length > 0 && (
                  <div className="flex justify-start mb-4">
                    <div className="max-w-xs lg:max-w-md">
                      <div className="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {typingUsers.length === 1 ? 'Escribiendo...' : `${typingUsers.length} personas escribiendo...`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                
                {/* Botón de mensajes nuevos */}
                {hasNewMessages && (
                  <div className="absolute bottom-4 right-4 z-10">
                    <Button
                      onClick={scrollToBottomAndClearNotification}
                      className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full p-3 animate-bounce"
                      size="sm"
                    >
                      <span className="text-xs mr-1">↓</span>
                      Nuevos mensajes
                    </Button>
                  </div>
                )}
              </div>

              {/* Input de mensaje */}
              <div className="p-4 border-t border-gray-200 bg-white relative">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setFileUploadOpen(!fileUploadOpen)}
                    >
                      <Paperclip size={16} />
                    </Button>
                    <FileUpload
                      onFileSelect={handleFileSelect}
                      isOpen={fileUploadOpen}
                      onToggle={() => setFileUploadOpen(false)}
                    />
                  </div>
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                    >
                      <Smile size={16} />
                    </Button>
                    <EmojiPicker
                      onEmojiSelect={handleEmojiSelect}
                      isOpen={emojiPickerOpen}
                    />
                  </div>
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      if (selectedConversation) {
                        handleTypingStart();
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    onKeyDown={(e) => {
                      if (selectedConversation && e.key !== 'Enter') {
                        handleTypingStart();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    size="sm"
                  >
                    <Send size={16} />
                  </Button>
                  

                </div>
                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-blue-700">Archivo seleccionado: {selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Selecciona una conversación</h3>
                <p className="text-sm">Elige una conversación para comenzar a chatear</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
