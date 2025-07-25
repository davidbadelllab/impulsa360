import { Server as SocketIOServer } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

interface SocketData {
  roomId?: string;
  userId?: string;
  username?: string;
}

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

class SocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Unirse a sala
      socket.on('join-room', async (data: SocketData) => {
        try {
          const { roomId, userId, username } = data;
          
          if (!roomId || !userId || !username) {
            socket.emit('error', { message: 'Missing required data' });
            return;
          }

          socket.join(roomId);
          (socket as any).roomId = roomId;
          (socket as any).userId = userId;
          (socket as any).username = username;

          // Actualizar participantes activos en DB
          await this.addParticipantToRoom(roomId, userId, socket.id, username);

          // Notificar a otros usuarios
          socket.to(roomId).emit('user-joined', {
            userId,
            username,
            socketId: socket.id
          });

          // Enviar lista de participantes actuales
          const participants = await this.getRoomParticipants(roomId);
          socket.emit('room-participants', participants);

        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Error joining room' });
        }
      });

      // Manejar ofertas WebRTC
      socket.on('webrtc-offer', (data: any) => {
        socket.to(data.target).emit('webrtc-offer', {
          offer: data.offer,
          sender: socket.id
        });
      });

      // Manejar respuestas WebRTC
      socket.on('webrtc-answer', (data: any) => {
        socket.to(data.target).emit('webrtc-answer', {
          answer: data.answer,
          sender: socket.id
        });
      });

      // Manejar candidatos ICE
      socket.on('webrtc-ice-candidate', (data: any) => {
        socket.to(data.target).emit('webrtc-ice-candidate', {
          candidate: data.candidate,
          sender: socket.id
        });
      });

      // Chat de texto
      socket.on('chat-message', async (data: any) => {
        try {
          const { roomId, message } = data;
          
          const chatMessage = {
            room_id: roomId,
            user_id: (socket as any).userId,
            username: (socket as any).username,
            message,
            message_type: 'text'
          };

          // Guardar en DB
          const { error } = await supabase
            .from('chat_messages')
            .insert(chatMessage);

          if (error) throw error;

          // Broadcast a todos en la sala
          this.io.to(roomId).emit('chat-message', {
            ...chatMessage,
            timestamp: new Date()
          });

        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Error sending message' });
        }
      });

      // Toggle de video/audio
      socket.on('toggle-media', async (data: any) => {
        try {
          const { roomId, mediaType, enabled } = data;
          
          await this.updateParticipantMedia(roomId, (socket as any).userId, mediaType, enabled);
          
          socket.to(roomId).emit('participant-media-changed', {
            userId: (socket as any).userId,
            mediaType,
            enabled
          });

        } catch (error) {
          console.error('Error updating media state:', error);
          socket.emit('error', { message: 'Error updating media state' });
        }
      });

      // Compartir pantalla
      socket.on('screen-share', (data: any) => {
        socket.to((socket as any).roomId).emit('screen-share', {
          userId: (socket as any).userId,
          enabled: data.enabled
        });
      });

      // Desconexión
      socket.on('disconnect', async () => {
        const roomId = (socket as any).roomId;
        const userId = (socket as any).userId;
        
        if (roomId && userId) {
          await this.removeParticipantFromRoom(roomId, userId);
          
          socket.to(roomId).emit('user-left', {
            userId,
            username: (socket as any).username
          });
        }
        
        console.log('User disconnected:', socket.id);
      });
    });
  }

  async addParticipantToRoom(roomId: string, userId: string, socketId: string, username: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: userId,
          socket_id: socketId,
          peer_id: socketId,
          video_enabled: true,
          audio_enabled: true,
          screen_share_enabled: false
        }, {
          onConflict: 'room_id,user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding participant to room:', error);
    }
  }

  async removeParticipantFromRoom(roomId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing participant from room:', error);
    }
  }

  async getRoomParticipants(roomId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_room_participants', { room_id_param: roomId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting room participants:', error);
      return [];
    }
  }

  async updateParticipantMedia(roomId: string, userId: string, mediaType: string, enabled: boolean) {
    try {
      const updateData: any = {};
      if (mediaType === 'video') updateData.video_enabled = enabled;
      if (mediaType === 'audio') updateData.audio_enabled = enabled;
      if (mediaType === 'screenShare') updateData.screen_share_enabled = enabled;

      const { error } = await supabase
        .from('room_participants')
        .update(updateData)
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating participant media:', error);
    }
  }

  // Método para obtener el historial de chat de una sala
  async getRoomChatHistory(roomId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_chat_history', { room_id_param: roomId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  // Método para limpiar salas inactivas
  async cleanupInactiveRooms() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .lt('joined_at', oneHourAgo.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up inactive rooms:', error);
    }
  }
}

export default SocketService; 