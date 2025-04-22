import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  UserPlus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Upload,
  MoreHorizontal,
  Briefcase,
  Shield,
  RefreshCw,
  Settings,
  Mail,
  Pencil,
  User,
  Mail as MailIcon,
  ShieldCheck,
  Eye,
  Building,
  ShieldAlert,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Checkbox } from "../../components/ui/checkbox";

// Define status types at the top of the file
type StatusType = 'active' | 'inactive' | 'pending';

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  company_id: number;
  is_superadmin: boolean;
  last_login?: string;
  status?: StatusType;
  avatar?: string;
}

interface Role {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

interface FilterOptions {
  role: number | null;
  company: number | null;
  status: string | null;
}

interface ApiResponse<T> {
  data: T | { data: T };
}

export default function UserPage() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ role: null, company: null, status: null });
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({key: 'username', direction: 'asc'});

  // Mocked statuses for the UI enhancement with type safety
  type StatusInfo = { color: string, label: string };
  
  const statuses: Record<StatusType, StatusInfo> = {
    'active': { color: 'bg-green-500', label: 'Active' },
    'inactive': { color: 'bg-red-500', label: 'Inactive' },
    'pending': { color: 'bg-yellow-500', label: 'Pending' }
  };

  const getStatusLabel = (status?: StatusType): string => {
    return status && statuses[status] ? statuses[status].label : 'Pending';
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Verificar si el servidor está corriendo
      console.log('Intentando obtener datos de usuarios...');
      
      const [usersRes, rolesRes, companiesRes] = await Promise.all([
        api.get<ApiResponse<User[]>>('/users'),
        api.get<ApiResponse<Role[]>>('/roles'),
        api.get<ApiResponse<Company[]>>('/companies')
      ]);
      
      console.log('Respuesta de usuarios:', usersRes);
      console.log('Respuesta de roles:', rolesRes);
      console.log('Respuesta de empresas:', companiesRes);
      
      // Comprobar si cada respuesta tiene la estructura esperada
      if (usersRes.data && (Array.isArray((usersRes.data as any).data) || Array.isArray(usersRes.data))) {
        // Algunos backends devuelven data.data, otros solo data
        const userData = (usersRes.data as any).data || usersRes.data;
        
        // Mapear los datos para asegurar que tengan el formato correcto
        const formattedUsers = userData.map((user: any) => ({
          id: user.id,
          username: user.username || 'Sin nombre',
          email: user.email || 'sin@email.com',
          role_id: user.role_id || 1,
          company_id: user.company_id || 1,
          is_superadmin: user.is_superadmin || false,
          last_login: user.last_login || undefined, // Manejar campo opcional
          status: user.status || 'active', // Valor por defecto si no viene
          avatar: user.avatar || undefined
        }));
        
        setUsers(formattedUsers);
      } else {
        console.error('Formato de respuesta de usuarios inesperado:', usersRes.data);
        setUsers([]);
      }
      
      if (rolesRes.data && (Array.isArray((rolesRes.data as any).data) || Array.isArray(rolesRes.data))) {
        setRoles((rolesRes.data as any).data || rolesRes.data);
      } else {
        console.error('Formato de respuesta de roles inesperado:', rolesRes.data);
        setRoles([]);
      }
      
      if (companiesRes.data && (Array.isArray((companiesRes.data as any).data) || Array.isArray(companiesRes.data))) {
        setCompanies((companiesRes.data as any).data || companiesRes.data);
      } else {
        console.error('Formato de respuesta de empresas inesperado:', companiesRes.data);
        setCompanies([]);
      }
      
      setLoading(false);
      setIsRefreshing(false);
    } catch (error: any) {
      console.error('Error al obtener datos:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      
      // Mostrar algunos datos de ejemplo para desarrollo
      setUsers([
        {
          id: 1,
          username: 'admin_demo',
          email: 'admin@demo.com',
          role_id: 1,
          company_id: 1,
          is_superadmin: true,
          status: 'active'
        },
        {
          id: 2,
          username: 'user_demo',
          email: 'user@demo.com',
          role_id: 2,
          company_id: 1,
          is_superadmin: false,
          status: 'active'
        }
      ]);
      
      setRoles([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Usuario' }
      ]);
      
      setCompanies([
        { id: 1, name: 'Empresa Demo' }
      ]);
      
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Apply sorting and filtering
  const sortedAndFilteredUsers = useMemo(() => {
    // Filter first
    let result = [...users];
    
    // Apply tab filtering
    if (activeTab === "active") {
      result = result.filter(user => user.status === "active");
    } else if (activeTab === "inactive") {
      result = result.filter(user => user.status === "inactive");
    } else if (activeTab === "pending") {
      result = result.filter(user => user.status === "pending");
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply additional filters
    if (filters.role !== null) {
      result = result.filter(user => user.role_id === filters.role);
    }
    if (filters.company !== null) {
      result = result.filter(user => user.company_id === filters.company);
    }
    if (filters.status !== null) {
      result = result.filter(user => user.status === filters.status);
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      const key = sortConfig.key as keyof User;
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, searchTerm, activeTab, filters, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(sortedAndFilteredUsers.map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      if (selectedUsers.length + 1 === sortedAndFilteredUsers.length) {
        setSelectAll(true);
      }
    }
  };

  const handleEdit = (user: User) => {
    setCurrentUser(user);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setCurrentUser({});
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (currentUser.id) {
        // Actualizar usuario existente
        const { data } = await api.put<{data: User}>(`/users/${currentUser.id}`, {
          username: currentUser.username,
          email: currentUser.email,
          role_id: currentUser.role_id,
          company_id: currentUser.company_id,
          is_superadmin: currentUser.is_superadmin,
          status: currentUser.status
        });
        
        setUsers(users.map(user => 
          user.id === currentUser.id ? {
            ...user,
            username: data.data.username,
            email: data.data.email,
            role_id: data.data.role_id,
            company_id: data.data.company_id,
            is_superadmin: data.data.is_superadmin,
            last_login: data.data.last_login || undefined,
            status: data.data.status || 'active'
          } : user
        ));
      } else {
        // Crear nuevo usuario
        const { data } = await api.post<{data: User}>('/users', {
          username: currentUser.username,
          email: currentUser.email,
          password: 'TempPassword123!', // Contraseña temporal
          role_id: currentUser.role_id,
          company_id: currentUser.company_id,
          is_superadmin: currentUser.is_superadmin || false,
          status: currentUser.status || 'active'
        });
        
        setUsers([...users, {
          id: data.data.id,
          username: data.data.username,
          email: data.data.email,
          role_id: data.data.role_id,
          company_id: data.data.company_id,
          is_superadmin: data.data.is_superadmin,
          status: data.data.status || 'active',
          last_login: undefined,
          avatar: undefined
        }]);
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving user:', error);
      // Aquí podrías agregar manejo de errores para mostrar al usuario
    }
  };

  const confirmDelete = (id: number) => {
    setUserToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete}`);
      setUsers(users.filter(user => user.id !== userToDelete));
      setSelectedUsers(selectedUsers.filter(id => id !== userToDelete));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 404) {
        // Usuario no encontrado, actualizar lista de todos modos
        setUsers(users.filter(user => user.id !== userToDelete));
      }
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'delete' && selectedUsers.length > 0) {
      // Handle bulk delete
      console.log('Bulk deleting users:', selectedUsers);
      setUsers(users.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
      setSelectAll(false);
    } else if (action === 'activate' && selectedUsers.length > 0) {
      // Handle bulk activate
      console.log('Bulk activating users:', selectedUsers);
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
      ));
    } else if (action === 'deactivate' && selectedUsers.length > 0) {
      // Handle bulk deactivate
      console.log('Bulk deactivating users:', selectedUsers);
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? { ...user, status: 'inactive' } : user
      ));
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    setFilters({ role: null, company: null, status: null });
    setSearchTerm('');
  };

  const getRoleName = (roleId: number) => {
    return roles.find(r => r.id === roleId)?.name || 'No role';
  };

  const getCompanyName = (companyId: number) => {
    return companies.find(c => c.id === companyId)?.name || 'No company';
  };

  const getInitials = (name: string) => {
    return name
      .split('_')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 px-1"
    >
      {/* Header with title and actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your users, roles and permissions
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  {selectedUsers.length} selected
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span>Activate</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      <XCircle className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>Deactivate</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9"
                  onClick={fetchData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button onClick={handleCreate} className="h-9 bg-indigo-600 hover:bg-indigo-700">
            <UserPlus className="mr-2 h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs and filters section */}
      <div className="flex flex-col gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All Users
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:text-green-600">
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </span>
              </TabsTrigger>
              <TabsTrigger value="inactive" className="data-[state=active]:bg-white data-[state=active]:text-red-600">
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                  Inactive
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-yellow-600">
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                  Pending
                </span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 bg-slate-50"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {(filters.role !== null || filters.company !== null || filters.status !== null) && (
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200" variant="secondary">
                        {Object.values(filters).filter(v => v !== null).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Filter Users</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-2">
                    <label className="text-xs font-medium mb-1 block">Role</label>
                    <Select
                      value={filters.role !== null ? filters.role.toString() : ""}
                      onValueChange={(value) => handleFilterChange('role', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="">All roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-2">
                    <label className="text-xs font-medium mb-1 block">Company</label>
                    <Select
                      value={filters.company !== null ? filters.company.toString() : ""}
                      onValueChange={(value) => handleFilterChange('company', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="">All companies</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-2">
                    <label className="text-xs font-medium mb-1 block">Status</label>
                    <Select
                      value={filters.status || ""}
                      onValueChange={(value) => handleFilterChange('status', value || null)}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DropdownMenuSeparator />
                  <div className="p-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs h-8">
                      Clear Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Main content with users table */}
          <TabsContent value="all" className="m-0">
            <Card className="overflow-hidden border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="w-14 px-4 py-3 text-left">
                        <Checkbox 
                          checked={selectAll} 
                          onCheckedChange={handleSelectAll}
                          className="rounded-sm data-[state=checked]:bg-indigo-600 border-slate-300"
                        />
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center">
                          <span>User</span>
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                            sortConfig.key === 'username' 
                              ? sortConfig.direction === 'asc' 
                                ? 'rotate-180' 
                                : '' 
                              : ''
                          }`} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sortedAndFilteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                            <p className="text-slate-500 mb-1">No users found</p>
                            <p className="text-slate-400 text-xs">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredUsers.map((user) => (
                        <motion.tr 
                          key={user.id}
                          className={`
                            hover:bg-slate-50 transition-colors
                            ${selectedUsers.includes(user.id) ? 'bg-indigo-50/50' : ''}
                          `}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="px-4 py-3">
                            <Checkbox 
                              checked={selectedUsers.includes(user.id)} 
                              onCheckedChange={() => handleSelectUser(user.id)}
                              className="rounded-sm data-[state=checked]:bg-indigo-600 border-slate-300"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                {user.avatar ? (
                                  <AvatarImage src={user.avatar} alt={user.username} />
                                ) : null}
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                  {getInitials(user.username)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-800">{user.username}</div>
                                <div className="text-slate-500 text-xs">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`
                                inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                                ${user.is_superadmin 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : user.role_id === 2 
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                                }
                              `}>
                                {user.is_superadmin ? (
                                  <Shield className="mr-1 h-3 w-3" />
                                ) : (
                                  <Briefcase className="mr-1 h-3 w-3" />
                                )}
                                {getRoleName(user.role_id)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {getCompanyName(user.company_id)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`
                              inline-flex items-center rounded-full px-2 py-1 text-xs
                              ${user.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : user.status === 'inactive'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }
                            `}>
                              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                user.status === 'active' ? 'bg-green-500' : 
                                user.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></span>
                              {getStatusLabel(user.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Never logged in'
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                      onClick={() => handleEdit(user)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => confirmDelete(user.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 shadow-lg">
                                  <DropdownMenuItem 
                                    className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50"
                                    onClick={() => {
                                      console.log('Opening permissions for user:', user.id);
                                      // Aquí implementarías la lógica para mostrar/editar permisos
                                      alert(`Administrar permisos para ${user.username}`);
                                    }}
                                  >
                                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Permissions</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50"
                                    onClick={() => {
                                      console.log('Sending email to user:', user.email);
                                      // Aquí implementarías la lógica para enviar email
                                      alert(`Enviar email a ${user.email}`);
                                    }}
                                  >
                                    <Mail className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Send email</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-200" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => confirmDelete(user.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button variant="outline" size="sm" className="text-sm">Previous</Button>
                  <Button variant="outline" size="sm" className="text-sm">Next</Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedAndFilteredUsers.length}</span> of{' '}
                      <span className="font-medium">{users.length}</span> users
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <Button variant="outline" size="sm" className="rounded-l-md border-slate-200">
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" className="bg-indigo-50 text-indigo-600 border-indigo-200 relative inline-flex items-center z-10">
                        1
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-200">
                        2
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-200">
                        3
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-r-md border-slate-200">
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="active" className="m-0">
            <Card className="overflow-hidden border-slate-200">
              {/* Active users content - same structure as "all" tab */}
              {/* For brevity, we're reusing the same content structure */}
            </Card>
          </TabsContent>
          
          <TabsContent value="inactive" className="m-0">
            <Card className="overflow-hidden border-slate-200">
              {/* Inactive users content */}
            </Card>
          </TabsContent>
          
          <TabsContent value="pending" className="m-0">
            <Card className="overflow-hidden border-slate-200">
              {/* Pending users content */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* User Create/Edit Dialog - Enhanced Version */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-800 border-0 shadow-2xl">
          <div className="absolute -top-12 left-0 right-0 mx-auto w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center border-2 border-white dark:border-slate-800">
            <div className="bg-indigo-600 rounded-full p-5 text-white">
              {currentUser.id ? (
                      <Pencil className="h-8 w-8" />
              ) : (
                <UserPlus className="h-8 w-8" />
              )}
            </div>
          </div>
          
          <DialogHeader className="mt-10 space-y-3">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent text-center">
              {currentUser.id ? 'Evolve Profile' : 'Onboard New Talent'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-center max-w-md mx-auto">
              {currentUser.id 
                ? "Update user details with precision. Changes take effect immediately across the platform." 
                : "Define a new team member's digital identity and access levels within your organization."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5">
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Username
                    </label>
                    <Input
                      id="username"
                      value={currentUser.username || ''}
                      onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                      placeholder="e.g. alex_smith"
                      className="h-11 font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <MailIcon className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={currentUser.email || ''}
                      onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                      placeholder="email@example.com"
                      className="h-11 font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5">
                    <label htmlFor="role" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <ShieldCheck className="h-4 w-4 inline mr-2" />
                      System Role
                    </label>
                    <Select
                      value={currentUser.role_id?.toString() || ''}
                      onValueChange={(value) => setCurrentUser({...currentUser, role_id: parseInt(value)})}
                    >
                      <SelectTrigger id="role" className="h-11 font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Define permissions" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()} className="focus:bg-indigo-50 dark:focus:bg-indigo-900">
                            <div className="flex items-center">
                              {role.name === 'Admin' && <ShieldCheck className="h-4 w-4 mr-2 text-indigo-600" />}
                              {role.name === 'Editor' && <Pencil className="h-4 w-4 mr-2 text-indigo-600" />}
                              {role.name === 'Viewer' && <Eye className="h-4 w-4 mr-2 text-indigo-600" />}
                              <span>{role.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5">
                    <label htmlFor="company" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Building className="h-4 w-4 inline mr-2" />
                      Organization
                    </label>
                    <Select
                      value={currentUser.company_id?.toString() || ''}
                      onValueChange={(value) => setCurrentUser({...currentUser, company_id: parseInt(value)})}
                    >
                      <SelectTrigger id="company" className="h-11 font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Assign workspace" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()} className="focus:bg-indigo-50 dark:focus:bg-indigo-900">
                            <div className="flex items-center">
                              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                              {company.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5">
                    <label htmlFor="status" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="h-4 w-4 inline mr-2" />
                      Estado del Usuario
                    </label>
                    <Select
                      value={currentUser.status || 'active'}
                      onValueChange={(value) => {
                        console.log('Status changed to:', value);
                        setCurrentUser({...currentUser, status: value as StatusType});
                      }}
                    >
                      <SelectTrigger id="status" className="h-11 font-medium border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500">
                        <SelectValue placeholder="Estado del usuario" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="active" className="focus:bg-indigo-50 dark:focus:bg-indigo-900">
                          <div className="flex items-center">
                            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                            <span>Activo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="focus:bg-indigo-50 dark:focus:bg-indigo-900">
                          <div className="flex items-center">
                            <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                            <span>Inactivo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pending" className="focus:bg-indigo-50 dark:focus:bg-indigo-900">
                          <div className="flex items-center">
                            <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                            <span>Pendiente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="relative bg-white dark:bg-slate-800 rounded-lg p-5 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative p-4 bg-white dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-amber-900 flex items-center">
                  <div className="mr-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3">
                    <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400">Elevated Access Control</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Super Admin privileges override role-based permissions and grant full system access.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input 
                        type="checkbox" 
                        id="is_superadmin"
                        checked={currentUser.is_superadmin || false}
                        onChange={(e) => 
                          setCurrentUser({...currentUser, is_superadmin: e.target.checked})
                        }
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label 
                        htmlFor="is_superadmin" 
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${currentUser.is_superadmin ? 'bg-amber-600' : 'bg-slate-300'}`}
                      ></label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1 border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!currentUser.username || !currentUser.email || !currentUser.role_id || !currentUser.company_id}
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg shadow-indigo-500/20"
            >
              {currentUser.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
