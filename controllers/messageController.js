import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3NTY0NTQsImV4cCI6MjA1MTMzMjQ1NH0.2fYpOdZYnL6kLdqOEGEGHO0lVBTdJCOhQEKLnfgxBVs';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Controlador de mensajes usando usuarios reales de Supabase');

// Datos temporales para conversaciones y mensajes hasta crear las tablas
let conversationsData = [];
let messagesData = [];
let nextConversationId = 1;
let nextMessageId = 1;

// Obtener todos los usuarios REALES registrados en Supabase
export const getUsers = async (req, res) => {
  try {
    const { currentUserId } = req.query;
    
    // Obtener usuarios reales de Supabase con sus roles
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, 
        username, 
        email, 
        created_at,
        roles(name)
      `)
      .neq('id', parseInt(currentUserId || 1)); // Excluir al usuario actual

    if (error) {
      console.error('Error obteniendo usuarios reales:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios'
      });
    }

    // Formatear usuarios para el sistema de mensajes
    const formattedUsers = (users || []).map(user => ({
      id: user.id,
      name: user.username || user.email.split('@')[0],
      email: user.email,
      avatar: null, // La tabla users no tiene columna avatar por ahora
      status: 'online', // Por ahora todos online, después puedes implementar estado real
      lastSeen: new Date().toISOString(),
      role: user.roles?.name || 'user' // Usar el rol real del usuario
    }));

    res.json({
      success: true,
      data: formattedUsers
    });

  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Buscar o crear conversación directa
export const findOrCreateDirectConversation = async (req, res) => {
  try {
    const { currentUserId, targetUserId } = req.body;

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'IDs de usuario requeridos'
      });
    }

    // Buscar conversación directa existente
    const existingConversation = conversationsData.find(conv => 
      conv.type === 'direct' && 
      conv.participants.includes(parseInt(currentUserId)) && 
      conv.participants.includes(parseInt(targetUserId))
    );

    if (existingConversation) {
      return res.json({
        success: true,
        data: existingConversation,
        isNew: false
      });
    }

    // Obtener información del usuario objetivo desde Supabase
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select(`
        id, 
        username, 
        email,
        roles(name)
      `)
      .eq('id', parseInt(targetUserId))
      .single();

    if (userError || !targetUser) {
      console.error('Error obteniendo usuario objetivo:', userError);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Crear nueva conversación directa
    const newConversation = {
      id: nextConversationId++,
      name: targetUser.username || targetUser.email.split('@')[0],
      type: 'direct',
      participants: [parseInt(currentUserId), parseInt(targetUserId)],
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: "active",
      avatar: null, // La tabla users no tiene columna avatar por ahora
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    conversationsData.push(newConversation);

    console.log('Nueva conversación directa creada:', newConversation);

    res.status(201).json({
      success: true,
      message: 'Conversación directa creada exitosamente',
      data: newConversation,
      isNew: true
    });

  } catch (error) {
    console.error('Error en findOrCreateDirectConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todas las conversaciones del usuario
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Filtrar conversaciones donde el usuario es participante
    const userConversations = conversationsData.filter(conv => 
      conv.participants.includes(parseInt(userId) || 1)
    );

    // Ordenar por último mensaje
    userConversations.sort((a, b) => 
      new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json({
      success: true,
      data: userConversations
    });

  } catch (error) {
    console.error('Error en getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener mensajes de una conversación
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Filtrar mensajes por conversación
    const conversationMessages = messagesData.filter(msg => 
      msg.conversationId === parseInt(conversationId)
    );

    // Ordenar por timestamp (más recientes primero)
    conversationMessages.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Paginación
    const offset = (page - 1) * limit;
    const paginatedMessages = conversationMessages.slice(offset, offset + parseInt(limit));

    // Marcar mensajes como leídos
    paginatedMessages.forEach(msg => {
      if (!msg.isRead) {
        msg.isRead = true;
        msg.status = 'read';
      }
    });

    res.json({
      success: true,
      data: paginatedMessages.reverse(), // Enviar en orden cronológico
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: conversationMessages.length
      }
    });

  } catch (error) {
    console.error('Error en getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Enviar un nuevo mensaje
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, senderId, content, type = 'text', attachments = [] } = req.body;

    // Validar campos requeridos
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversación, remitente y contenido son requeridos'
      });
    }

    // Verificar que la conversación existe
    const conversation = conversationsData.find(c => c.id === parseInt(conversationId));
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversación no encontrada'
      });
    }

    // Obtener información del usuario que envía el mensaje
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', parseInt(senderId))
      .single();

    if (senderError || !sender) {
      console.error('Error obteniendo información del remitente:', senderError);
      return res.status(404).json({
        success: false,
        message: 'Usuario remitente no encontrado'
      });
    }

    // Crear el nuevo mensaje
    const newMessage = {
      id: nextMessageId++,
      conversationId: parseInt(conversationId),
      senderId: parseInt(senderId),
      senderName: sender.username || sender.email.split('@')[0],
      content,
      type,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isRead: false,
      attachments
    };

    messagesData.push(newMessage);

    // Actualizar la conversación
    const conversationIndex = conversationsData.findIndex(c => c.id === parseInt(conversationId));
    if (conversationIndex !== -1) {
      conversationsData[conversationIndex].lastMessage = content;
      conversationsData[conversationIndex].lastMessageTime = newMessage.timestamp;
      conversationsData[conversationIndex].updated_at = new Date().toISOString();
    }

    console.log('Mensaje enviado:', newMessage);

    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: newMessage
    });

  } catch (error) {
    console.error('Error en sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear una nueva conversación
export const createConversation = async (req, res) => {
  try {
    const { name, type, participants, avatar } = req.body;

    // Validar campos requeridos
    if (!name || !type || !participants || participants.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, tipo y al menos 2 participantes son requeridos'
      });
    }

    // Validar tipo de conversación
    const validTypes = ['direct', 'group', 'team', 'support'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de conversación inválido'
      });
    }

    // Crear la nueva conversación
    const newConversation = {
      id: nextConversationId++,
      name,
      type,
      participants: participants.map(p => parseInt(p)),
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: "active",
      avatar,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    conversationsData.push(newConversation);

    console.log('Conversación creada:', newConversation);

    res.status(201).json({
      success: true,
      message: 'Conversación creada exitosamente',
      data: newConversation
    });

  } catch (error) {
    console.error('Error en createConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Marcar mensajes como leídos
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Marcar todos los mensajes de la conversación como leídos
    const updatedMessages = messagesData.map(msg => {
      if (msg.conversationId === parseInt(conversationId) && 
          msg.senderId !== parseInt(userId) && 
          !msg.isRead) {
        return { ...msg, isRead: true, status: 'read' };
      }
      return msg;
    });

    messagesData = updatedMessages;

    // Actualizar contador de mensajes no leídos en la conversación
    const conversationIndex = conversationsData.findIndex(c => c.id === parseInt(conversationId));
    if (conversationIndex !== -1) {
      conversationsData[conversationIndex].unreadCount = 0;
    }

    res.json({
      success: true,
      message: 'Mensajes marcados como leídos'
    });

  } catch (error) {
    console.error('Error en markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar mensaje
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const messageIndex = messagesData.findIndex(msg => msg.id === parseInt(messageId));
    
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    // Verificar que el usuario es el propietario del mensaje
    if (messagesData[messageIndex].senderId !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este mensaje'
      });
    }

    messagesData.splice(messageIndex, 1);

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de mensajes
export const getMessageStats = async (req, res) => {
  try {
    const { userId } = req.query;

    const userConversations = conversationsData.filter(conv => 
      conv.participants.includes(parseInt(userId) || 1)
    );

    const totalMessages = messagesData.filter(msg => 
      userConversations.some(conv => conv.id === msg.conversationId)
    ).length;

    const unreadMessages = userConversations.reduce((total, conv) => 
      total + conv.unreadCount, 0
    );

    const activeConversations = userConversations.filter(conv => 
      conv.status === 'active'
    ).length;

    res.json({
      success: true,
      data: {
        totalConversations: userConversations.length,
        activeConversations,
        totalMessages,
        unreadMessages,
        todayMessages: messagesData.filter(msg => {
          const today = new Date();
          const messageDate = new Date(msg.timestamp);
          return messageDate.toDateString() === today.toDateString() &&
                 userConversations.some(conv => conv.id === msg.conversationId);
        }).length
      }
    });

  } catch (error) {
    console.error('Error en getMessageStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Almacenar estado de typing en memoria (en producción usar Redis)
let typingData = new Map(); // conversationId -> { userId, timestamp }

// Enviar estado de typing
export const sendTypingStatus = async (req, res) => {
  try {
    const { conversationId, userId, typing } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId y userId son requeridos'
      });
    }

    const conversationKey = `conversation_${conversationId}`;
    
    if (typing) {
      // Agregar usuario a la lista de typing
      if (!typingData.has(conversationKey)) {
        typingData.set(conversationKey, new Map());
      }
      
      typingData.get(conversationKey).set(userId, {
        userId: parseInt(userId),
        timestamp: Date.now()
      });
      
      // Limpiar typing expirado (más de 5 segundos)
      const conversationTyping = typingData.get(conversationKey);
      const now = Date.now();
      
      for (const [uid, data] of conversationTyping.entries()) {
        if (now - data.timestamp > 5000) {
          conversationTyping.delete(uid);
        }
      }
      
      if (conversationTyping.size === 0) {
        typingData.delete(conversationKey);
      }
    } else {
      // Remover usuario de la lista de typing
      if (typingData.has(conversationKey)) {
        typingData.get(conversationKey).delete(userId);
        
        if (typingData.get(conversationKey).size === 0) {
          typingData.delete(conversationKey);
        }
      }
    }

    res.json({
      success: true,
      message: 'Estado de typing actualizado'
    });

  } catch (error) {
    console.error('Error en sendTypingStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuarios que están escribiendo
export const getTypingUsers = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'conversationId es requerido'
      });
    }

    const conversationKey = `conversation_${conversationId}`;
    const typingUsers = [];

    if (typingData.has(conversationKey)) {
      const conversationTyping = typingData.get(conversationKey);
      const now = Date.now();

      // Limpiar typing expirado y obtener usuarios activos
      for (const [uid, data] of conversationTyping.entries()) {
        if (now - data.timestamp > 5000) {
          conversationTyping.delete(uid);
        } else if (parseInt(uid) !== parseInt(userId)) {
          // No incluir al usuario actual
          typingUsers.push(parseInt(uid));
        }
      }

      if (conversationTyping.size === 0) {
        typingData.delete(conversationKey);
      }
    }

    res.json({
      success: true,
      data: typingUsers
    });

  } catch (error) {
    console.error('Error en getTypingUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Limpiar typing expirado periódicamente
setInterval(() => {
  const now = Date.now();
  
  for (const [conversationKey, conversationTyping] of typingData.entries()) {
    for (const [userId, data] of conversationTyping.entries()) {
      if (now - data.timestamp > 5000) {
        conversationTyping.delete(userId);
      }
    }
    
    if (conversationTyping.size === 0) {
      typingData.delete(conversationKey);
    }
  }
}, 3000); // Limpiar cada 3 segundos 