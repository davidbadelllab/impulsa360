import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

interface Briefing {
  id: number;
  type: string;
  category: string;
  title: string;
  description: string;
  company_id?: number;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  status: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

const BriefingsIndex: React.FC = () => {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBriefings();
  }, []);

  const fetchBriefings = async () => {
    try {
      const response = await api.get('/briefings');
      if (response.data.success) {
        setBriefings(response.data.data);
      } else {
        setError('Error al cargar briefings');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar briefings');
      console.error('Error fetching briefings:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBriefing = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este briefing?')) {
      return;
    }

    try {
      const response = await api.delete(`/briefings/${id}`);
      if (response.data.success) {
        setBriefings(briefings.filter(b => b.id !== id));
      } else {
        setError('Error al eliminar briefing');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar briefing');
      console.error('Error deleting briefing:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Diseño':
        return 'bg-purple-100 text-purple-800';
      case 'Programación':
        return 'bg-green-100 text-green-800';
      case 'Marketing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Briefings</h1>
        <Link
          to="/dashboard/briefings/create"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Crear Briefing
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {briefings.length === 0 ? (
            <li className="px-6 py-4">
              <p className="text-gray-500 text-center">No hay briefings disponibles</p>
            </li>
          ) : (
            briefings.map((briefing) => (
              <li key={briefing.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(briefing.type)}`}>
                        {briefing.type}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {briefing.title || 'Sin título'}
                        </div>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(briefing.status)}`}>
                          {briefing.status}
                        </span>
                        {!briefing.is_read && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No leído
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {briefing.category || 'Sin categoría'} • Prioridad: {briefing.priority || 'Media'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Creado: {new Date(briefing.created_at).toLocaleDateString()}
                        {briefing.due_date && ` • Entrega: ${new Date(briefing.due_date).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/dashboard/briefings/${briefing.id}`}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver
                    </Link>
                    <Link
                      to={`/dashboard/briefings/${briefing.id}/edit`}
                      className="text-green-600 hover:text-green-900 text-sm font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteBriefing(briefing.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default BriefingsIndex;
