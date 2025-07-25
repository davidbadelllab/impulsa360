import React from 'react';

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

interface ParticipantsListProps {
  participants: Participant[];
  onClose: () => void;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({ participants, onClose }) => {
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-white font-semibold">
          Participantes ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-4">
        {participants.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No hay participantes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.userId}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {participant.username.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* User info */}
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {participant.username}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Se unió a las {formatTime(participant.joinedAt)}
                    </div>
                  </div>
                </div>

                {/* Media status */}
                <div className="flex gap-2">
                  {!participant.mediaState.audio && (
                    <div className="bg-red-500 text-white p-1 rounded-full" title="Micrófono desactivado">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {!participant.mediaState.video && (
                    <div className="bg-red-500 text-white p-1 rounded-full" title="Cámara desactivada">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {participant.mediaState.screenShare && (
                    <div className="bg-green-500 text-white p-1 rounded-full" title="Compartiendo pantalla">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsList; 