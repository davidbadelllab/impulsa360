import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  role: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get<{
          id: number;
          username: string;
          role: string;
        }>('http://localhost:3001/api/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser({
          id: response.data.id,
          username: response.data.username,
          role: response.data.role
        });
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Bienvenido, {user?.username}
          </h2>
          <p className="mb-4">Rol: {user?.role}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
