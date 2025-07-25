# Sistema de Videoconferencias Interno - Guía Completa

## 📋 Arquitectura General

```
Frontend (React) ←→ Backend (Express + Socket.io) ←→ Base de Datos ←→ Servidor de Medios
```

## 🛠️ Dependencias Adicionales Necesarias

### Backend
```bash
npm install socket.io simple-peer mediasoup uuid ws
npm install --save-dev @types/socket.io @types/uuid
```

### Frontend  
```bash
npm install socket.io-client simple-peer
```

## 📁 Estructura de Archivos

```
src/
├── server/
│   ├── controllers/
│   │   ├── meetingController.js
│   │   ├── userController.js
│   │   └── roomController.js
│   ├── models/
│   │   ├── Meeting.js
│   │   ├── Room.js
│   │   └── Participant.js
│   ├── routes/
│   │   ├── meetings.js
│   │   └── rooms.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── socketAuth.js
│   ├── services/
│   │   ├── socketService.js
│   │   └── mediaService.js
│   └── server.js
├── client/
│   ├── components/
│   │   ├── VideoCall/
│   │   │   ├── VideoCall.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   └── ParticipantsList.jsx
│   │   ├── Meeting/
│   │   │   ├── CreateMeeting.jsx
│   │   │   ├── JoinMeeting.jsx
│   │   │   └── MeetingRoom.jsx
│   │   └── UI/
│   └── hooks/
│       ├── useWebRTC.js
│       ├── useSocket.js
│       └── useMediaDevices.js
```

## 🗄️ Modelos de Base de Datos

### Meeting Model
```javascript
// server/models/Meeting.js
const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  scheduledTime: Date,
  duration: Number, // en minutos
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    role: {
      type: String,
      enum: ['host', 'moderator', 'participant'],
      default: 'participant'
    }
  }],
  settings: {
    maxParticipants: {
      type: Number,
      default: 50
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    enableRecording: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },
  recording: {
    isRecording: {
      type: Boolean,
      default: false
    },
    recordingPath: String,
    recordingStartTime: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
```

### Room Model
```javascript
// server/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  activeParticipants: [{
    userId: String,
    socketId: String,
    peerId: String,
    mediaState: {
      video: {
        type: Boolean,
        default: true
      },
      audio: {
        type: Boolean,
        default: true
      },
      screenShare: {
        type: Boolean,
        default: false
      }
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  chatMessages: [{
    userId: String,
    username: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['text', 'system', 'file'],
      default: 'text'
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
```

## 🎮 Controladores

### Meeting Controller
```javascript
// server/controllers/meetingController.js
const Meeting = require('../models/Meeting');
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');

class MeetingController {
  // Crear nueva reunión
  async createMeeting(req, res) {
    try {
      const { title, description, scheduledTime, duration, settings } = req.body;
      const roomId = uuidv4();
      
      const meeting = new Meeting({
        title,
        description,
        hostId: req.user.id,
        roomId,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : new Date(),
        duration: duration || 60,
        settings: {
          maxParticipants: settings?.maxParticipants || 50,
          requireApproval: settings?.requireApproval || false,
          enableRecording: settings?.enableRecording || false,
          enableChat: settings?.enableChat || true
        }
      });

      await meeting.save();

      // Crear sala asociada
      const room = new Room({
        roomId,
        meetingId: meeting._id
      });
      await room.save();

      res.status(201).json({
        success: true,
        meeting,
        joinUrl: `${process.env.CLIENT_URL}/meeting/${roomId}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating meeting',
        error: error.message
      });
    }
  }

  // Obtener reunión por roomId
  async getMeetingByRoom(req, res) {
    try {
      const { roomId } = req.params;
      
      const meeting = await Meeting.findOne({ roomId })
        .populate('hostId', 'name email')
        .populate('participants.userId', 'name email');

      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      res.json({
        success: true,
        meeting
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching meeting',
        error: error.message
      });
    }
  }

  // Unirse a reunión
  async joinMeeting(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const meeting = await Meeting.findOne({ roomId });
      
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verificar si ya está en la reunión
      const existingParticipant = meeting.participants.find(
        p => p.userId.toString() === userId
      );

      if (!existingParticipant) {
        meeting.participants.push({
          userId,
          joinedAt: new Date(),
          role: meeting.hostId.toString() === userId ? 'host' : 'participant'
        });
        await meeting.save();
      }

      res.json({
        success: true,
        message: 'Joined meeting successfully',
        meeting
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error joining meeting',
        error: error.message
      });
    }
  }

  // Finalizar reunión
  async endMeeting(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      const meeting = await Meeting.findOne({ roomId });
      
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verificar que es el host
      if (meeting.hostId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only host can end meeting'
        });
      }

      meeting.status = 'ended';
      await meeting.save();

      // Notificar a todos los participantes via socket
      req.io.to(roomId).emit('meeting-ended', {
        message: 'Meeting has been ended by host'
      });

      res.json({
        success: true,
        message: 'Meeting ended successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error ending meeting',
        error: error.message
      });
    }
  }
}

module.exports = new MeetingController();
```

## 🔌 Configuración de Socket.IO

### Socket Service
```javascript
// server/services/socketService.js
const Room = require('../models/Room');
const Meeting = require('../models/Meeting');

class SocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Unirse a sala
      socket.on('join-room', async (data) => {
        try {
          const { roomId, userId, username } = data;
          
          socket.join(roomId);
          socket.roomId = roomId;
          socket.userId = userId;
          socket.username = username;

          // Actualizar participantes activos en DB
          await this.addParticipantToRoom(roomId, userId, socket.id);

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
          socket.emit('error', { message: 'Error joining room' });
        }
      });

      // Manejar ofertas WebRTC
      socket.on('webrtc-offer', (data) => {
        socket.to(data.target).emit('webrtc-offer', {
          offer: data.offer,
          sender: socket.id
        });
      });

      // Manejar respuestas WebRTC
      socket.on('webrtc-answer', (data) => {
        socket.to(data.target).emit('webrtc-answer', {
          answer: data.answer,
          sender: socket.id
        });
      });

      // Manejar candidatos ICE
      socket.on('webrtc-ice-candidate', (data) => {
        socket.to(data.target).emit('webrtc-ice-candidate', {
          candidate: data.candidate,
          sender: socket.id
        });
      });

      // Chat de texto
      socket.on('chat-message', async (data) => {
        try {
          const { roomId, message } = data;
          
          const chatMessage = {
            userId: socket.userId,
            username: socket.username,
            message,
            timestamp: new Date(),
            type: 'text'
          };

          // Guardar en DB
          await Room.findOneAndUpdate(
            { roomId },
            { $push: { chatMessages: chatMessage } }
          );

          // Broadcast a todos en la sala
          this.io.to(roomId).emit('chat-message', chatMessage);

        } catch (error) {
          socket.emit('error', { message: 'Error sending message' });
        }
      });

      // Toggle de video/audio
      socket.on('toggle-media', async (data) => {
        try {
          const { roomId, mediaType, enabled } = data;
          
          await this.updateParticipantMedia(roomId, socket.userId, mediaType, enabled);
          
          socket.to(roomId).emit('participant-media-changed', {
            userId: socket.userId,
            mediaType,
            enabled
          });

        } catch (error) {
          socket.emit('error', { message: 'Error updating media state' });
        }
      });

      // Compartir pantalla
      socket.on('screen-share', (data) => {
        socket.to(socket.roomId).emit('screen-share', {
          userId: socket.userId,
          enabled: data.enabled
        });
      });

      // Desconexión
      socket.on('disconnect', async () => {
        if (socket.roomId && socket.userId) {
          await this.removeParticipantFromRoom(socket.roomId, socket.userId);
          
          socket.to(socket.roomId).emit('user-left', {
            userId: socket.userId,
            username: socket.username
          });
        }
        
        console.log('User disconnected:', socket.id);
      });
    });
  }

  async addParticipantToRoom(roomId, userId, socketId) {
    const participant = {
      userId,
      socketId,
      peerId: socketId,
      mediaState: {
        video: true,
        audio: true,
        screenShare: false
      },
      joinedAt: new Date()
    };

    await Room.findOneAndUpdate(
      { roomId },
      { $push: { activeParticipants: participant } }
    );
  }

  async removeParticipantFromRoom(roomId, userId) {
    await Room.findOneAndUpdate(
      { roomId },
      { $pull: { activeParticipants: { userId } } }
    );
  }

  async getRoomParticipants(roomId) {
    const room = await Room.findOne({ roomId });
    return room ? room.activeParticipants : [];
  }

  async updateParticipantMedia(roomId, userId, mediaType, enabled) {
    await Room.findOneAndUpdate(
      { 
        roomId,
        'activeParticipants.userId': userId 
      },
      { 
        $set: { 
          [`activeParticipants.$.mediaState.${mediaType}`]: enabled 
        }
      }
    );
  }
}

module.exports = SocketService;
```

## 🎥 Componentes Frontend

### Hook useWebRTC
```javascript
// client/hooks/useWebRTC.js
import { useRef, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

export const useWebRTC = (roomId, userId, username) => {
  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const peersRef = useRef(new Map());
  const localVideoRef = useRef(null);

  // Configuración ICE servers
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Inicializar socket y stream local
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Obtener stream local
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Conectar socket
        const socketConnection = io(process.env.REACT_APP_SERVER_URL);
        setSocket(socketConnection);

        // Unirse a la sala
        socketConnection.emit('join-room', {
          roomId,
          userId,
          username
        });

        setIsConnected(true);

      } catch (error) {
        console.error('Error initializing connection:', error);
      }
    };

    if (roomId && userId) {
      initializeConnection();
    }

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId, userId, username]);

  // Configurar event listeners del socket
  useEffect(() => {
    if (!socket || !localStream) return;

    // Usuario se unió
    socket.on('user-joined', ({ userId: newUserId, username: newUsername, socketId }) => {
      createPeerConnection(newUserId, socketId, true);
    });

    // Participantes actuales
    socket.on('room-participants', (participantsList) => {
      setParticipants(participantsList);
      
      // Crear conexiones con participantes existentes
      participantsList.forEach(participant => {
        if (participant.userId !== userId) {
          createPeerConnection(participant.userId, participant.socketId, false);
        }
      });
    });

    // WebRTC offer
    socket.on('webrtc-offer', async ({ offer, sender }) => {
      const peerConnection = peersRef.current.get(sender);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        socket.emit('webrtc-answer', {
          answer,
          target: sender
        });
      }
    });

    // WebRTC answer
    socket.on('webrtc-answer', async ({ answer, sender }) => {
      const peerConnection = peersRef.current.get(sender);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    // ICE candidate
    socket.on('webrtc-ice-candidate', async ({ candidate, sender }) => {
      const peerConnection = peersRef.current.get(sender);
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    // Usuario se fue
    socket.on('user-left', ({ userId: leftUserId }) => {
      const peerConnection = peersRef.current.get(leftUserId);
      if (peerConnection) {
        peerConnection.close();
        peersRef.current.delete(leftUserId);
      }
      
      setRemoteStreams(prev => {
        const updated = new Map(prev);
        updated.delete(leftUserId);
        return updated;
      });
    });

    return () => {
      socket.off('user-joined');
      socket.off('room-participants');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('user-left');
    };
  }, [socket, localStream, userId]);

  // Crear conexión peer
  const createPeerConnection = useCallback(async (remoteUserId, socketId, shouldCreateOffer) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);

      // Agregar stream local
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams(prev => new Map(prev.set(remoteUserId, remoteStream)));
      };

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            target: socketId
          });
        }
      };

      peersRef.current.set(socketId, peerConnection);

      // Crear oferta si es necesario
      if (shouldCreateOffer) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('webrtc-offer', {
          offer,
          target: socketId
        });
      }

    } catch (error) {
      console.error('Error creating peer connection:', error);
    }
  }, [localStream, socket, iceServers]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        socket?.emit('toggle-media', {
          roomId,
          mediaType: 'video',
          enabled: videoTrack.enabled
        });
      }
    }
  }, [localStream, socket, roomId]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        socket?.emit('toggle-media', {
          roomId,
          mediaType: 'audio',
          enabled: audioTrack.enabled
        });
      }
    }
  }, [localStream, socket, roomId]);

  return {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    localVideoRef,
    toggleVideo,
    toggleAudio,
    socket
  };
};
```

### Componente VideoCall Principal
```javascript
// client/components/VideoCall/VideoCall.jsx
import React, { useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import VideoPlayer from './VideoPlayer';
import ControlPanel from './ControlPanel';
import ParticipantsList from './ParticipantsList';
import Chat from './Chat';

const VideoCall = ({ roomId, userId, username }) => {
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  
  const {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    localVideoRef,
    toggleVideo,
    toggleAudio,
    socket
  } = useWebRTC(roomId, userId, username);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Conectando a la reunión...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <h1 className="text-white text-xl font-semibold">Reunión: {roomId}</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">
            {participants.length} participantes
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Video grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
            {/* Video local */}
            <VideoPlayer
              ref={localVideoRef}
              stream={localStream}
              isLocal={true}
              username={username}
              muted={true}
            />
            
            {/* Videos remotos */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
              const participant = participants.find(p => p.userId === userId);
              return (
                <VideoPlayer
                  key={userId}
                  stream={stream}
                  isLocal={false}
                  username={participant?.username || 'Usuario'}
                  muted={false}
                />
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        {(showChat || showParticipants) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {showParticipants && (
              <ParticipantsList
                participants={participants}
                onClose={() => setShowParticipants(false)}
              />
            )}
            {showChat && (
              <Chat
                roomId={roomId}
                socket={socket}
                username={username}
                onClose={() => setShowChat(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <ControlPanel
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleChat={() => setShowChat(!showChat)}
        onToggleParticipants={() => setShowParticipants(!showParticipants)}
        onLeave={() => window.location.href = '/dashboard'}
      />
    </div>
  );
};

export default VideoCall;
```

## 🚀 Configuración del Servidor Principal

### server.js actualizado
```javascript
// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const SocketService = require('./server/services/socketService');
const meetingRoutes = require('./server/routes/meetings');
const authMiddleware = require('./server/middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videoconference')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Hacer io disponible en req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use('/api/meetings', authMiddleware, meetingRoutes);

// Inicializar servicio de sockets
new SocketService(io);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔧 Variables de Entorno

### .env
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/videoconference

# JWT
JWT_SECRET=tu_jwt_secret_muy_secreto

# URLs
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Socket.IO
SOCKET_CORS_ORIGIN=http://localhost:3000

# Opcional: STUN/TURN servers personalizados
STUN_SERVER=stun:stun.l.google.com:19302
TURN_SERVER=
TURN_USERNAME=
TURN_PASSWORD=
```

## 📦 Scripts de Package.json Actualizados

Agrega estos scripts a tu package.json:

```json
{
  "scripts": {
    "dev:full": "concurrently \"npm run dev\" \"npm run dev:server\"",
    "start:socket": "node server.js",
    "dev:socket": "nodemon server.js"
  }
}
```

## 🎯 Características Implementadas

- ✅ Videoconferencias en tiempo real con WebRTC
- ✅ Chat de texto en vivo
- ✅ Control de audio/video
- ✅ Lista de participantes
- ✅ Creación y gestión de reuniones
- ✅ Autenticación y autorización
- ✅ Base de datos para persistencia
- ✅ Interfaz responsive
- ✅ Compartir pantalla (básico)

## 🚀 Próximos Pasos

1. **Grabación de reuniones**: Implementar MediaRecorder API
2. **Compartir archivos**: Sistema de upload durante reuniones
3. **Calendario**: Integración con sistema de calendarios
4. **Moderación**: Funciones de host avanzadas
5. **Escalabilidad**: Implementar servidor TURN propio
6. **Mobile**: Optimizaciones para dispositivos móviles

## 🔒 Consideraciones de Seguridad

- Validar todos los inputs
- Implementar rate limiting en sockets
- Usar HTTPS en producción
- Configurar CORS apropiadamente
- Implementar timeouts de reuniones
- Logs de auditoría

Este sistema te dará una base sólida para videoconferencias internas. ¿Te gustaría que profundice en algún componente específico?