import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Users, Building, Calendar, FolderOpen, TrendingUp, BarChart3 } from 'lucide-react';
import axios from 'axios';

interface AppointmentStatus {
  [status: string]: number;
}

interface FileByUser {
  [userId: string]: {
    name: string;
    type: string;
    date: string;
  }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [users, setUsers] = useState(0);
  const [companies, setCompanies] = useState(0);
  const [appointments, setAppointments] = useState(0);
  const [appointmentsStatus, setAppointmentsStatus] = useState<AppointmentStatus>({});
  const [filesByUser, setFilesByUser] = useState<FileByUser>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Iniciando peticiones al dashboard...');
    // Usuarios
    axios.get('http://localhost:3000/api/dashboard/users-count')
      .then(res => {
        console.log('👥 Usuarios response:', res.data);
        setUsers(res.data.total || 0);
      })
      .catch(err => {
        console.error('❌ Error usuarios:', err);
        setUsers(0);
      });
    // Empresas
    axios.get('http://localhost:3000/api/dashboard/companies-count')
      .then(res => {
        console.log('🏢 Empresas response:', res.data);
        setCompanies(res.data.total || 0);
      })
      .catch(err => {
        console.error('❌ Error empresas:', err);
        setCompanies(0);
      });
    // Citas
    axios.get('http://localhost:3000/api/dashboard/appointments-stats')
      .then(res => {
        console.log('📅 Citas response:', res.data);
        setAppointments(res.data.total || 0);
        setAppointmentsStatus(res.data.byStatus || {});
      })
      .catch(err => {
        console.error('❌ Error citas:', err);
        setAppointments(0);
        setAppointmentsStatus({});
      });
    // Archivos
    axios.get('http://localhost:3000/api/dashboard/files-stats')
      .then(res => {
        console.log('📁 Archivos response:', res.data);
        setFilesByUser(res.data.filesByUser || {});
      })
      .catch(err => {
        console.error('❌ Error archivos:', err);
        setFilesByUser({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Preparar datos para gráficos
  const appointmentStatusData = Object.entries(appointmentsStatus || {}).map(([status, count]) => ({ status, count }));
  const filesByUserData = Object.entries(filesByUser || {}).map(([userId, files]) => ({ userId, count: files.length }));
  const filesTypeData: { type: string; count: number }[] = [];
  Object.values(filesByUser || {}).flat().forEach(file => {
    const found = filesTypeData.find(f => f.type === file.type);
    if (found) found.count++;
    else filesTypeData.push({ type: file.type, count: 1 });
  });

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen de métricas y estadísticas del sistema</p>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando métricas...</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Cards resumen */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          <Users className="h-4 w-4 text-blue-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users}</div>
          <p className="text-xs text-blue-100">Total registrados</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Empresas</CardTitle>
          <Building className="h-4 w-4 text-green-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{companies}</div>
          <p className="text-xs text-green-100">Total registradas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Citas</CardTitle>
          <Calendar className="h-4 w-4 text-purple-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{appointments}</div>
          <p className="text-xs text-purple-100">Total programadas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Archivos</CardTitle>
          <FolderOpen className="h-4 w-4 text-orange-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.values(filesByUser || {}).flat().length}</div>
          <p className="text-xs text-orange-100">Total almacenados</p>
        </CardContent>
      </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Citas por estado</CardTitle>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={appointmentStatusData}>
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Archivos por usuario</CardTitle>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={filesByUserData}>
            <XAxis dataKey="userId" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Archivos por tipo</CardTitle>
        </CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={filesTypeData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
              {filesTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
