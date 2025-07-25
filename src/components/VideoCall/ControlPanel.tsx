import React from 'react';

interface ControlPanelProps {
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onLeave: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  showChat?: boolean;
  showParticipants?: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onToggleVideo,
  onToggleAudio,
  onToggleChat,
  onToggleParticipants,
  onLeave,
  isVideoEnabled = true,
  isAudioEnabled = true,
  showChat = false,
  showParticipants = false
}) => {
  return (
    <div className="bg-gray-800 p-4 flex items-center justify-center gap-4">
      {/* Botón de micrófono */}
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full transition-colors ${
          isAudioEnabled 
            ? 'bg-gray-600 hover:bg-gray-500 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isAudioEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
      >
        {isAudioEnabled ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Botón de cámara */}
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full transition-colors ${
          isVideoEnabled 
            ? 'bg-gray-600 hover:bg-gray-500 text-white' 
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={isVideoEnabled ? 'Apagar cámara' : 'Encender cámara'}
      >
        {isVideoEnabled ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Botón de chat */}
      <button
        onClick={onToggleChat}
        className={`p-3 rounded-full transition-colors ${
          showChat 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-600 hover:bg-gray-500 text-white'
        }`}
        title="Chat"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Botón de participantes */}
      <button
        onClick={onToggleParticipants}
        className={`p-3 rounded-full transition-colors ${
          showParticipants 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-600 hover:bg-gray-500 text-white'
        }`}
        title="Participantes"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Separador */}
      <div className="w-px h-8 bg-gray-600"></div>

      {/* Botón de salir */}
      <button
        onClick={onLeave}
        className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
        title="Salir de la reunión"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default ControlPanel; 