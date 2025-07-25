import React, { useState } from 'react';

interface CreateMeetingProps {
  onCreateMeeting: (meetingData: any) => void;
  onCancel: () => void;
}

const CreateMeeting: React.FC<CreateMeetingProps> = ({ onCreateMeeting, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    duration: 60,
    settings: {
      maxParticipants: 50,
      requireApproval: false,
      enableRecording: false,
      enableChat: true
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Reunión</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título de la reunión *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Reunión de equipo semanal"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional de la reunión"
            />
          </div>

          {/* Fecha y hora */}
          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora programada
            </label>
            <input
              type="datetime-local"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duración */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
              <option value={180}>3 horas</option>
            </select>
          </div>

          {/* Configuraciones */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Configuraciones</h3>
            
            {/* Máximo de participantes */}
            <div className="mb-3">
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de participantes
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="settings.maxParticipants"
                value={formData.settings.maxParticipants}
                onChange={handleChange}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="settings.requireApproval"
                  checked={formData.settings.requireApproval}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Requerir aprobación para unirse</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="settings.enableRecording"
                  checked={formData.settings.enableRecording}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Permitir grabación</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="settings.enableChat"
                  checked={formData.settings.enableChat}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Habilitar chat</span>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Crear Reunión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMeeting; 