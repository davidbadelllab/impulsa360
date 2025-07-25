import React, { useState, useEffect } from 'react';
import CreateMeeting from '../../components/VideoCall/CreateMeeting';
import JoinMeeting from '../../components/VideoCall/JoinMeeting';
import VideoCall from '../../components/VideoCall/VideoCall';

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  roomId: string;
  scheduledTime?: Date;
  status: 'scheduled' | 'active' | 'ended';
  hostId: {
    name: string;
    email: string;
  };
  participants: Array<{
    userId: string;
    joinedAt: Date;
    role: string;
  }>;
  createdAt: Date;
}

const VideoConferencePage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState<{
    roomId: string;
    userId: string;
    username: string;
  } | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simular datos del usuario (en producción vendría del contexto de autenticación)
  const currentUser = {
    id: '1',
    name: 'Usuario Demo',
    email: 'usuario@demo.com'
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      // En producción, hacer llamada a la API
      const response = await fetch('/api/meetings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      } else {
        throw new Error('Error al cargar reuniones');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Error al cargar las reuniones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        fetchMeetings();
        
        // Opcional: unirse inmediatamente a la reunión creada
        // setCurrentMeeting({
        //   roomId: data.meeting.roomId,
        //   userId: currentUser.id,
        //   username: currentUser.name
        // });
      } else {
        throw new Error('Error al crear reunión');
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Error al crear la reunión');
    }
  };

  const handleJoinMeeting = async (roomId: string) => {
    try {
      const response = await fetch(`/api/meetings/join/${roomId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setShowJoinModal(false);
        setCurrentMeeting({
          roomId,
          userId: currentUser.id,
          username: currentUser.name
        });
      } else {
        throw new Error('Error al unirse a la reunión');
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError('Error al unirse a la reunión');
    }
  };

  const handleEndMeeting = async (roomId: string) => {
    try {
      const response = await fetch(`/api/meetings/end/${roomId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchMeetings();
      } else {
        throw new Error('Error al finalizar reunión');
      }
    } catch (error) {
      console.error('Error ending meeting:', error);
      setError('Error al finalizar la reunión');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'En curso';
      case 'scheduled':
        return 'Programada';
      case 'ended':
        return 'Finalizada';
      default:
        return status;
    }
  };

  // Si hay una reunión activa, mostrar la videoconferencia
  if (currentMeeting) {
    return (
      <VideoCall
        roomId={currentMeeting.roomId}
        userId={currentMeeting.userId}
        username={currentMeeting.username}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Videoconferencias</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y participa en reuniones virtuales
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Unirse
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Nueva Reunión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reuniones</p>
                <p className="text-2xl font-semibold text-gray-900">{meetings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En Curso</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {meetings.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Programadas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {meetings.filter(m => m.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Mis Reuniones</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Cargando reuniones...</p>
            </div>
          ) : meetings.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reuniones</h3>
              <p className="text-gray-500 mb-4">Crea tu primera reunión o únete a una existente</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Crear Reunión
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                          {getStatusText(meeting.status)}
                        </span>
                      </div>
                      {meeting.description && (
                        <p className="text-gray-600 mb-2">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Organizada por: {meeting.hostId.name}</span>
                        <span>•</span>
                        <span>{meeting.participants.length} participantes</span>
                        <span>•</span>
                        <span>Creada: {formatDate(meeting.createdAt)}</span>
                        {meeting.scheduledTime && (
                          <>
                            <span>•</span>
                            <span>Programada: {formatDate(meeting.scheduledTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {meeting.status === 'active' && (
                        <button
                          onClick={() => setCurrentMeeting({
                            roomId: meeting.roomId,
                            userId: currentUser.id,
                            username: currentUser.name
                          })}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                        >
                          Unirse
                        </button>
                      )}
                      {meeting.status === 'scheduled' && (
                        <button
                          onClick={() => setCurrentMeeting({
                            roomId: meeting.roomId,
                            userId: currentUser.id,
                            username: currentUser.name
                          })}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                        >
                          Iniciar
                        </button>
                      )}
                      {meeting.status === 'active' && meeting.hostId.email === currentUser.email && (
                        <button
                          onClick={() => handleEndMeeting(meeting.roomId)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                        >
                          Finalizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateMeeting
          onCreateMeeting={handleCreateMeeting}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {showJoinModal && (
        <JoinMeeting
          onJoinMeeting={handleJoinMeeting}
          onCancel={() => setShowJoinModal(false)}
        />
      )}
    </div>
  );
};

export default VideoConferencePage; 