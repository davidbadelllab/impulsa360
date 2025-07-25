import React, { useState } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import VideoPlayer from './VideoPlayer';
import ControlPanel from './ControlPanel';
import ParticipantsList from './ParticipantsList';
import Chat from './Chat';

interface VideoCallProps {
  roomId: string;
  userId: string;
  username: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, username }) => {
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
    socket,
    error
  } = useWebRTC(roomId, userId, username);

  const handleLeave = () => {
    if (socket) {
      socket.disconnect();
    }
    window.location.href = '/dashboard';
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error de conexión</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleLeave}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Conectando a la reunión...</h2>
          <p className="text-gray-300">Estableciendo conexión con los participantes</p>
        </div>
      </div>
    );
  }

  const isVideoEnabled = localStream?.getVideoTracks()[0]?.enabled ?? true;
  const isAudioEnabled = localStream?.getAudioTracks()[0]?.enabled ?? true;

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-semibold">Reunión en curso</h1>
          <div className="flex items-center gap-2 text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{participants.length} participantes</span>
          </div>
        </div>
        <div className="text-gray-300 text-sm">
          ID de sala: {roomId}
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
        onLeave={handleLeave}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        showChat={showChat}
        showParticipants={showParticipants}
      />
    </div>
  );
};

export default VideoCall; 