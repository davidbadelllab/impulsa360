import { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Participant {
  userId: string;
  socketId: string;
  username: string;
  mediaState: {
    video: boolean;
    audio: boolean;
    screenShare: boolean;
  };
  joinedAt: Date;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  isConnected: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  toggleVideo: () => void;
  toggleAudio: () => void;
  socket: Socket | null;
  error: string | null;
}

export const useWebRTC = (
  roomId: string, 
  userId: string, 
  username: string
): UseWebRTCReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);

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
        setError(null);
        
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
        const socketConnection = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3000');
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
        setError('Error al acceder a la cámara y micrófono');
      }
    };

    if (roomId && userId && username) {
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
    socket.on('room-participants', (participantsList: Participant[]) => {
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
        try {
          await peerConnection.setRemoteDescription(offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socket.emit('webrtc-answer', {
            answer,
            target: sender
          });
        } catch (error) {
          console.error('Error handling WebRTC offer:', error);
        }
      }
    });

    // WebRTC answer
    socket.on('webrtc-answer', async ({ answer, sender }) => {
      const peerConnection = peersRef.current.get(sender);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(answer);
        } catch (error) {
          console.error('Error handling WebRTC answer:', error);
        }
      }
    });

    // ICE candidate
    socket.on('webrtc-ice-candidate', async ({ candidate, sender }) => {
      const peerConnection = peersRef.current.get(sender);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
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

      setParticipants(prev => prev.filter(p => p.userId !== leftUserId));
    });

    // Error handling
    socket.on('error', ({ message }) => {
      setError(message);
    });

    // Meeting ended
    socket.on('meeting-ended', ({ message }) => {
      setError(message);
      setIsConnected(false);
    });

    return () => {
      socket.off('user-joined');
      socket.off('room-participants');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('user-left');
      socket.off('error');
      socket.off('meeting-ended');
    };
  }, [socket, localStream, userId]);

  // Crear conexión peer
  const createPeerConnection = useCallback(async (
    remoteUserId: string, 
    socketId: string, 
    shouldCreateOffer: boolean
  ) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);

      // Agregar stream local
      localStream!.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream!);
      });

      // Manejar stream remoto
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setRemoteStreams(prev => new Map(prev.set(remoteUserId, remoteStream)));
      };

      // Manejar candidatos ICE
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket!.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            target: socketId
          });
        }
      };

      // Manejar cambios de estado de conexión
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${remoteUserId}:`, peerConnection.connectionState);
      };

      peersRef.current.set(socketId, peerConnection);

      // Crear oferta si es necesario
      if (shouldCreateOffer) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket!.emit('webrtc-offer', {
          offer,
          target: socketId
        });
      }

    } catch (error) {
      console.error('Error creating peer connection:', error);
      setError('Error al establecer conexión con participante');
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
    socket,
    error
  };
}; 