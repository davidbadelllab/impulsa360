import { useState, useEffect, useMemo } from 'react';
import api from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Settings,
  Building,
  Users,
  Briefcase,
  Phone,
  Mail,
  MoreHorizontal,
  X,
  Calendar,
  PieChart,
  Link,
  UserPlus,
  Shield,
  Eye,
  MapPin,
  AlertTriangle
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
import {
  Badge
} from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";

// Define types
type StatusType = 'active' | 'inactive' | 'pending';

interface Company {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status?: StatusType;
  created_at?: string;
}

interface Client {
  id: number;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  logo?: string;
  status?: StatusType;
}

interface Team {
  id: number;
  name: string;
  company_id: number;
  created_at?: string;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  price_per_month: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  company_id: number;
}

interface Plan {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_by: number;
  company_id: number;
  team_id?: number;
  created_at?: string;
}

interface CompanyService {
  id: number;
  company_id: number;
  service_id: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

interface FilterOptions {
  status: string | null;
  hasClients: boolean | null;
  hasTeams: boolean | null;
}

interface ApiResponse<T> {
  data: T | { data: T };
}

interface CompanyWithStats extends Company {
  clientCount?: number;
  teamCount?: number;
  serviceCount?: number;
  planCount?: number;
}

export default function CompanyPage() {
  // State management
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyService[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Partial<Company>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ 
    status: null, 
    hasClients: null,
    hasTeams: null
  });
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({
    key: 'name', 
    direction: 'asc'
  });
  
  // Selected company details
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<number | null>(null);
  const [detailsTab, setDetailsTab] = useState("overview");
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [currentCompanyService, setCurrentCompanyService] = useState<Partial<CompanyService>>({});
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState<Partial<Client>>({});

  // Mocked statuses for the UI enhancement
  const statuses: Record<StatusType, { color: string, label: string }> = {
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
    setError(null);
    try {
      console.log('Fetching company data...');
      
      // Fetch all data in parallel for efficiency
      const [companiesRes, clientsRes, teamsRes, servicesRes, companyServicesRes, plansRes, usersRes] = await Promise.all([
        api.get<ApiResponse<Company[]>>('/companies'),
        api.get<ApiResponse<Client[]>>('/clients'),
        api.get<ApiResponse<Team[]>>('/teams'),
        api.get<ApiResponse<Service[]>>('/services'),
        api.get<ApiResponse<CompanyService[]>>('/company-services'),
        api.get<ApiResponse<Plan[]>>('/plans'),
        api.get<ApiResponse<User[]>>('/users')
      ]);
      
      // Process company data
      if (companiesRes.data) {
        const companyData = Array.isArray(companiesRes.data) 
          ? companiesRes.data 
          : Array.isArray((companiesRes.data as any).data) 
            ? (companiesRes.data as any).data 
            : [];
        
        setCompanies(companyData);
      }
      
      // Process client data
      if (clientsRes.data) {
        const clientData = Array.isArray(clientsRes.data) 
          ? clientsRes.data 
          : Array.isArray((clientsRes.data as any).data) 
            ? (clientsRes.data as any).data 
            : [];
            
        setClients(clientData);
      }
      
      // Process team data
      if (teamsRes.data) {
        const teamData = Array.isArray(teamsRes.data) 
          ? teamsRes.data 
          : Array.isArray((teamsRes.data as any).data) 
            ? (teamsRes.data as any).data 
            : [];
            
        setTeams(teamData);
      }
      
      // Process service data
      if (servicesRes.data) {
        const serviceData = Array.isArray(servicesRes.data) 
          ? servicesRes.data 
          : Array.isArray((servicesRes.data as any).data) 
            ? (servicesRes.data as any).data 
            : [];
            
        setServices(serviceData);
      }
      
      // Process company services data
      if (companyServicesRes.data) {
        const companyServiceData = Array.isArray(companyServicesRes.data) 
          ? companyServicesRes.data 
          : Array.isArray((companyServicesRes.data as any).data) 
            ? (companyServicesRes.data as any).data 
            : [];
            
        setCompanyServices(companyServiceData);
      }
      
      // Process plans data
      if (plansRes.data) {
        const planData = Array.isArray(plansRes.data) 
          ? plansRes.data 
          : Array.isArray((plansRes.data as any).data) 
            ? (plansRes.data as any).data 
            : [];
            
        setPlans(planData);
      }
      
      // Process users data
      if (usersRes.data) {
        const userData = Array.isArray(usersRes.data) 
          ? usersRes.data 
          : Array.isArray((usersRes.data as any).data) 
            ? (usersRes.data as any).data 
            : [];
            
        setUsers(userData);
      }
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Error loading data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate company statistics and apply filtering/sorting
  const sortedAndFilteredCompanies = useMemo(() => {
    // First enhance companies with stats
    const companiesWithStats = companies.map(company => {
      const clientCount = clients.filter(client => client.company_id === company.id).length;
      const teamCount = teams.filter(team => team.company_id === company.id).length;
      const serviceCount = companyServices.filter(cs => cs.company_id === company.id && cs.is_active).length;
      const planCount = plans.filter(plan => plan.company_id === company.id).length;
      
      return {
        ...company,
        clientCount,
        teamCount,
        serviceCount,
        planCount
      };
    });
    
    // Then filter companies
    let result = [...companiesWithStats];
    
    // Apply tab filtering only if not using status filter
    if (activeTab !== "all" && filters.status === null) {
      result = result.filter(company => {
        // Si la compañía no tiene status, asumimos 'active' por defecto
        const companyStatus = company.status || 'active';
        return companyStatus === activeTab;
      });
    }
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply additional filters regardless of active tab
    if (filters.status !== null) {
      result = result.filter(company => {
        // Si la compañía no tiene status, asumimos 'active' por defecto
        const companyStatus = company.status || 'active';
        return companyStatus === filters.status;
      });
    }
    
    if (filters.hasClients !== null) {
      const companyIdsWithClients = new Set(clients.map(client => client.company_id));
      if (filters.hasClients) {
        result = result.filter(company => companyIdsWithClients.has(company.id));
      } else {
        result = result.filter(company => !companyIdsWithClients.has(company.id));
      }
    }
    
    if (filters.hasTeams !== null) {
      const companyIdsWithTeams = new Set(teams.map(team => team.company_id));
      if (filters.hasTeams) {
        result = result.filter(company => companyIdsWithTeams.has(company.id));
      } else {
        result = result.filter(company => !companyIdsWithTeams.has(company.id));
      }
    }
    
    // Apply sorting
    return result.sort((a, b) => {
      const key = sortConfig.key as keyof CompanyWithStats;
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
  }, [companies, clients, teams, companyServices, plans, searchTerm, activeTab, filters, sortConfig]);

  // Get company details for the selected company
  const selectedCompanyData = useMemo(() => {
    if (!selectedCompanyDetails) return null;
    
    const company = companies.find(c => c.id === selectedCompanyDetails);
    if (!company) return null;
    
    const companyClients = clients.filter(c => c.company_id === selectedCompanyDetails);
    const companyTeams = teams.filter(t => t.company_id === selectedCompanyDetails);
    const companyActiveServices = companyServices.filter(
      cs => cs.company_id === selectedCompanyDetails && cs.is_active
    );
    const companyPlans = plans.filter(p => p.company_id === selectedCompanyDetails);
    const companyUsers = users.filter(u => u.company_id === selectedCompanyDetails);
    
    // Get service details for each company service
    const activeServiceDetails = companyActiveServices.map(cs => {
      const serviceInfo = services.find(s => s.id === cs.service_id);
      return {
        ...cs,
        serviceName: serviceInfo?.name,
        serviceDescription: serviceInfo?.description,
        price: serviceInfo?.price_per_month
      };
    });
    
    return {
      ...company,
      clients: companyClients,
      teams: companyTeams,
      services: activeServiceDetails,
      plans: companyPlans,
      users: companyUsers
    };
  }, [selectedCompanyDetails, companies, clients, teams, companyServices, services, plans, users]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(sortedAndFilteredCompanies.map(company => company.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectCompany = (companyId: number) => {
    if (selectedCompanies.includes(companyId)) {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
      setSelectAll(false);
    } else {
      setSelectedCompanies([...selectedCompanies, companyId]);
      if (selectedCompanies.length + 1 === sortedAndFilteredCompanies.length) {
        setSelectAll(true);
      }
    }
  };

  const handleViewDetails = (companyId: number) => {
    setSelectedCompanyDetails(companyId);
    setDetailsTab("overview");
  };

  const handleEdit = (company: Company) => {
    setCurrentCompany(company);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setCurrentCompany({});
    setOpenDialog(true);
  };

  const handleAddService = (companyId: number) => {
    setCurrentCompanyService({
      company_id: companyId,
      start_date: new Date().toISOString().split('T')[0],
      is_active: true
    });
    setShowAddServiceDialog(true);
  };

  const handleAddClient = (companyId: number) => {
    setCurrentClient({
      company_id: companyId
    });
    setShowAddClientDialog(true);
  };

  const handleSaveCompany = async () => {
    try {
      console.log('Guardando empresa con datos:', currentCompany);
      
      if (currentCompany.id) {
        // Update existing company
        const response = await api.put<{data: Company}>(`/companies/${currentCompany.id}`, {
          name: currentCompany.name,
          address: currentCompany.address,
          phone: currentCompany.phone,
          email: currentCompany.email,
          status: currentCompany.status || 'active'
        });
        
        console.log('Respuesta del servidor:', response);
        
        // Update companies state after success
        const updatedCompany = response.data && 'data' in response.data 
          ? response.data.data 
          : response.data;
          
        setCompanies(companies.map(company => 
          company.id === currentCompany.id ? { ...company, ...updatedCompany } : company
        ));
      } else {
        // Create new company
        const response = await api.post<{data: Company}>('/companies', {
          name: currentCompany.name,
          address: currentCompany.address,
          phone: currentCompany.phone,
          email: currentCompany.email,
          status: currentCompany.status || 'active'
        });
        
        // Add new company to state after success
        const newCompany = response.data && 'data' in response.data 
          ? response.data.data 
          : response.data;
          
        setCompanies([...companies, newCompany]);
      }
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Error saving company:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido al guardar la empresa';
      
      // Mostrar detalles del error para ayudar a depurar
      console.error('Detalles del error:', { 
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Here you would typically show an error notification to the user
      alert(`Error al guardar empresa: ${errorMessage}`);
    }
  };

  const handleSaveCompanyService = async () => {
    try {
      if (!currentCompanyService.service_id || !currentCompanyService.company_id) {
        alert('Please select a service');
        return;
      }
      
      // Create new company service
      const response = await api.post<{data: CompanyService}>('/company-services', {
        company_id: currentCompanyService.company_id,
        service_id: currentCompanyService.service_id,
        start_date: currentCompanyService.start_date,
        is_active: true
      });
      
      // Add new service to state after success
      const newCompanyService = response.data && 'data' in response.data 
        ? response.data.data 
        : response.data;
        
      setCompanyServices([...companyServices, newCompanyService]);
      setShowAddServiceDialog(false);
    } catch (error: any) {
      console.error('Error adding service:', error);
      alert(`Error adding service: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleSaveClient = async () => {
    try {
      if (!currentClient.name || !currentClient.company_id) {
        alert('Please enter client name');
        return;
      }
      
      // Create new client
      const response = await api.post<{data: Client}>('/clients', {
        company_id: currentClient.company_id,
        name: currentClient.name,
        email: currentClient.email,
        phone: currentClient.phone
      });
      
      // Add new client to state after success
      const newClient = response.data && 'data' in response.data 
        ? response.data.data 
        : response.data;
        
      setClients([...clients, newClient]);
      setShowAddClientDialog(false);
    } catch (error: any) {
      console.error('Error adding client:', error);
      alert(`Error adding client: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const confirmDelete = (id: number) => {
    setCompanyToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    
    try {
      // Check for dependent records before deleting
      const hasClients = clients.some(client => client.company_id === companyToDelete);
      const hasTeams = teams.some(team => team.company_id === companyToDelete);
      const hasUsers = users.some(user => user.company_id === companyToDelete);
      
      if (hasClients || hasTeams || hasUsers) {
        alert('Cannot delete company with associated clients, teams, or users. Remove dependencies first.');
        setShowDeleteConfirm(false);
        setCompanyToDelete(null);
        return;
      }
      
      await api.delete(`/companies/${companyToDelete}`);
      
      // Update state after successful deletion
      setCompanies(companies.filter(company => company.id !== companyToDelete));
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyToDelete));
      
      // Close detail view if the deleted company was selected
      if (selectedCompanyDetails === companyToDelete) {
        setSelectedCompanyDetails(null);
      }
      
      setShowDeleteConfirm(false);
      setCompanyToDelete(null);
    } catch (error: any) {
      console.error('Error deleting company:', error);
      alert(`Error deleting company: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCompanies.length === 0) return;
    
    try {
      if (action === 'delete') {
        // Check for dependencies
        const companiesWithDependencies = selectedCompanies.filter(companyId => 
          clients.some(client => client.company_id === companyId) ||
          teams.some(team => team.company_id === companyId) ||
          users.some(user => user.company_id === companyId)
        );
        
        if (companiesWithDependencies.length > 0) {
          const companyNames = companiesWithDependencies.map(id => {
            const company = companies.find(c => c.id === id);
            return company ? company.name : `ID: ${id}`;
          }).join(', ');
          
          alert(`Cannot delete companies with dependencies: ${companyNames}`);
          return;
        }
        
        // Delete each company
        await Promise.all(
          selectedCompanies.map(id => api.delete(`/companies/${id}`))
        );
        
        setCompanies(companies.filter(company => !selectedCompanies.includes(company.id)));
        
        // Close detail view if the deleted company was selected
        if (selectedCompanyDetails && selectedCompanies.includes(selectedCompanyDetails)) {
          setSelectedCompanyDetails(null);
        }
      } else if (action === 'activate' || action === 'deactivate') {
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        
        // Update each company
        await Promise.all(
          selectedCompanies.map(id => 
            api.put(`/companies/${id}`, { status: newStatus })
          )
        );
        
        // Update local state
        setCompanies(companies.map(company => 
          selectedCompanies.includes(company.id) 
            ? { ...company, status: newStatus as StatusType } 
            : company
        ));
      }
      
      setSelectedCompanies([]);
      setSelectAll(false);
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleTabChange = (value: string) => {
    // Al cambiar de pestaña, limpiar los filtros para evitar conflictos
    clearFilters();
    setActiveTab(value);
  };

  const clearFilters = () => {
    setFilters({ status: null, hasClients: null, hasTeams: null });
    setSearchTerm('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Data</h2>
        <p className="text-slate-600 text-center mb-6">{error}</p>
        <div className="flex flex-col space-y-4 items-center">
          <Button onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <p className="text-sm text-slate-500 max-w-md text-center">
            Error al cargar datos reales del servidor. Asegúrate de que el servidor esté ejecutándose en el puerto 3001 y que las rutas /companies, /clients, etc. estén configuradas correctamente.
          </p>
        </div>
      </div>
    );
  }

  // If company details are selected, render the detailed view
  if (selectedCompanyDetails !== null && selectedCompanyData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6"
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedCompanyDetails(null)}
              className="h-9 w-9"
            >
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">{selectedCompanyData.name}</h1>
            <Badge 
              className={`${selectedCompanyData.status === 'active' 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : selectedCompanyData.status === 'inactive' 
                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'} 
                  ml-2`}
            >
              {getStatusLabel(selectedCompanyData.status)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="h-9 gap-2"
              onClick={() => handleEdit(selectedCompanyData)}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
        
        {/* Tabs for company details */}
        <Tabs defaultValue="overview" value={detailsTab} onValueChange={setDetailsTab}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-white">
              Clients ({selectedCompanyData.clients?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-white">
              Teams ({selectedCompanyData.teams?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-white">
              Services ({selectedCompanyData.services?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white">
              Plans ({selectedCompanyData.plans?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-white">
              Users ({selectedCompanyData.users?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          {/* Overview tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Building className="mr-2 h-5 w-5 text-indigo-500" />
                  Company Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Name</h4>
                    <p className="text-slate-800">{selectedCompanyData.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Address</h4>
                    <p className="text-slate-800">{selectedCompanyData.address || 'Not specified'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Email</h4>
                      <p className="text-slate-800">{selectedCompanyData.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-500">Phone</h4>
                      <p className="text-slate-800">{selectedCompanyData.phone || 'Not specified'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Created</h4>
                    <p className="text-slate-800">
                      {selectedCompanyData.created_at 
                        ? new Date(selectedCompanyData.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-indigo-500" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {selectedCompanyData.clients?.length || 0}
                    </span>
                    <span className="text-sm text-blue-700 mt-1">Clients</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-purple-600">
                      {selectedCompanyData.teams?.length || 0}
                    </span>
                    <span className="text-sm text-purple-700 mt-1">Teams</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">
                      {selectedCompanyData.services?.length || 0}
                    </span>
                    <span className="text-sm text-green-700 mt-1">Services</span>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-amber-600">
                      {selectedCompanyData.users?.length || 0}
                    </span>
                    <span className="text-sm text-amber-700 mt-1">Users</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Recent Activity</h4>
                  {selectedCompanyData.plans && selectedCompanyData.plans.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCompanyData.plans.slice(0, 3).map(plan => (
                        <div key={plan.id} className="flex items-center bg-slate-50 p-2 rounded-md">
                          <div className="h-2 w-2 rounded-full mr-2" 
                               style={{ 
                                 backgroundColor: plan.status === 'active' 
                                   ? '#16a34a' 
                                   : plan.status === 'pending' 
                                     ? '#f59e0b' 
                                     : '#64748b' 
                               }} 
                          />
                          <span className="text-sm text-slate-700">{plan.name}</span>
                          <span className="text-xs text-slate-500 ml-auto">
                            {plan.created_at 
                              ? new Date(plan.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'N/A'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic">No recent activity</div>
                  )}
                </div>
              </Card>
              
              <Card className="p-6 shadow-sm md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Link className="mr-2 h-5 w-5 text-indigo-500" />
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="h-24 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    onClick={() => handleAddClient(selectedCompanyData.id)}
                  >
                    <UserPlus className="h-6 w-6" />
                    <span>Add Client</span>
                  </Button>
                  
                  <Button 
                    className="h-24 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                    onClick={() => alert('Create team feature not yet implemented')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Create Team</span>
                  </Button>
                  
                  <Button 
                    className="h-24 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                    onClick={() => handleAddService(selectedCompanyData.id)}
                  >
                    <Shield className="h-6 w-6" />
                    <span>Add Service</span>
                  </Button>
                  
                  <Button 
                    className="h-24 flex-col gap-2 bg-gradient-to-br from-amber-500 to-amber-600 shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                    onClick={() => alert('Create plan feature not yet implemented')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span>Create Plan</span>
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          </Tabs>
        
        {/* Add Service Dialog */}
        <Dialog open={showAddServiceDialog} onOpenChange={setShowAddServiceDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Service to Company</DialogTitle>
              <DialogDescription>
                Subscribe this company to one of our available services.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Select Service</h4>
                <Select
                  value={currentCompanyService.service_id?.toString() || ''}
                  onValueChange={(value) => setCurrentCompanyService({
                    ...currentCompanyService, 
                    service_id: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent className="bg-white shadow-md border border-slate-200">
                    <SelectGroup>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          <div className="flex justify-between items-center w-full">
                            <span>{service.name}</span>
                            <span className="text-sm text-slate-500">
                              ${service.price_per_month.toFixed(2)}/mo
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Start Date</h4>
                <Input
                  type="date"
                  value={currentCompanyService.start_date || ''}
                  onChange={(e) => setCurrentCompanyService({
                    ...currentCompanyService,
                    start_date: e.target.value
                  })}
                />
              </div>
              
              {currentCompanyService.service_id && (
                <div className="rounded-md bg-blue-50 p-4 mt-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Service Information</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          {services.find(s => s.id === currentCompanyService.service_id)?.description || 
                            'No description available.'}
                        </p>
                        <p className="mt-2 font-semibold">
                          Price: ${services.find(s => s.id === currentCompanyService.service_id)?.price_per_month.toFixed(2)}/month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddServiceDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCompanyService} 
                disabled={!currentCompanyService.service_id || !currentCompanyService.start_date}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Service
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Client Dialog */}
        <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client for this company. Clients are organizations that the company provides services to.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Client Name*</h4>
                <Input
                  placeholder="Enter client name"
                  value={currentClient.name || ''}
                  onChange={(e) => setCurrentClient({
                    ...currentClient, 
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Email Address</h4>
                <Input
                  type="email"
                  placeholder="client@example.com"
                  value={currentClient.email || ''}
                  onChange={(e) => setCurrentClient({
                    ...currentClient,
                    email: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Phone Number</h4>
                <Input
                  placeholder="(555) 123-4567"
                  value={currentClient.phone || ''}
                  onChange={(e) => setCurrentClient({
                    ...currentClient,
                    phone: e.target.value
                  })}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveClient} 
                disabled={!currentClient.name}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Add Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  // Main companies listing view
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
          <h1 className="text-2xl font-bold text-slate-800">Company Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your companies, clients, and services
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <AnimatePresence>
            {selectedCompanies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                  {selectedCompanies.length} selected
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white border border-slate-200 shadow-lg">
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
            <Building className="mr-2 h-4 w-4" />
            <span>Add Company</span>
          </Button>
        </div>
      </div>
      
      {/* Tabs and filters section */}
      <div className="flex flex-col gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All Companies
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
              <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:text-amber-600">
                <span className="flex items-center">
                  <span className="h-2 w-2 bg-amber-500 rounded-full mr-2"></span>
                  Pending
                </span>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search companies..."
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
                    {(filters.status !== null || filters.hasClients !== null || filters.hasTeams !== null) && (
                      <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200" variant="secondary">
                        {Object.values(filters).filter(v => v !== null).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72">
                  <DropdownMenuLabel>Filter Companies</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
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
                  
                  <div className="p-2">
                    <label className="text-xs font-medium mb-1 block">Has Clients</label>
                    <Select
                      value={filters.hasClients === null 
                        ? "" 
                        : filters.hasClients 
                          ? "yes" 
                          : "no"}
                      onValueChange={(value) => {
                        if (value === "") {
                          handleFilterChange('hasClients', null);
                        } else {
                          handleFilterChange('hasClients', value === "yes");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="">All companies</SelectItem>
                        <SelectItem value="yes">With clients</SelectItem>
                        <SelectItem value="no">Without clients</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="p-2">
                    <label className="text-xs font-medium mb-1 block">Has Teams</label>
                    <Select
                      value={filters.hasTeams === null 
                        ? "" 
                        : filters.hasTeams 
                          ? "yes" 
                          : "no"}
                      onValueChange={(value) => {
                        if (value === "") {
                          handleFilterChange('hasTeams', null);
                        } else {
                          handleFilterChange('hasTeams', value === "yes");
                        }
                      }}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-md border border-slate-200">
                        <SelectItem value="">All companies</SelectItem>
                        <SelectItem value="yes">With teams</SelectItem>
                        <SelectItem value="no">Without teams</SelectItem>
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
          
          {/* Main content with companies table */}
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
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>Company</span>
                          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${
                            sortConfig.key === 'name' 
                              ? sortConfig.direction === 'asc' 
                                ? 'rotate-180' 
                                : '' 
                              : ''
                          }`} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Clients
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Teams
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {sortedAndFilteredCompanies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                            <p className="text-slate-500 mb-1">No companies found</p>
                            <p className="text-slate-400 text-xs">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      sortedAndFilteredCompanies.map((company) => (
                        <motion.tr 
                          key={company.id}
                          className={`
                            hover:bg-slate-50 transition-colors
                            ${selectedCompanies.includes(company.id) ? 'bg-indigo-50/50' : ''}
                          `}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <td className="px-4 py-3">
                            <Checkbox 
                              checked={selectedCompanies.includes(company.id)} 
                              onCheckedChange={() => handleSelectCompany(company.id)}
                              className="rounded-sm data-[state=checked]:bg-indigo-600 border-slate-300"
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                {company.logo ? (
                                  <AvatarImage src={company.logo} alt={company.name} />
                                ) : null}
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                                  {getInitials(company.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div 
                                  className="font-medium text-slate-800 hover:text-indigo-600 cursor-pointer"
                                  onClick={() => handleViewDetails(company.id)}
                                >
                                  {company.name}
                                </div>
                                <div className="text-slate-500 text-xs">{company.address}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm">
                              {company.email && (
                                <div className="flex items-center text-slate-600">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {company.email}
                                </div>
                              )}
                              {company.phone && (
                                <div className="flex items-center text-slate-600 mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {company.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-xl font-semibold text-blue-600">{company.clientCount || 0}</span>
                              <span className="text-xs text-slate-500">Clients</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-xl font-semibold text-purple-600">{company.teamCount || 0}</span>
                              <span className="text-xs text-slate-500">Teams</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`
                              inline-flex items-center rounded-full px-2 py-1 text-xs
                              ${company.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : company.status === 'inactive'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }
                            `}>
                              <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                company.status === 'active' ? 'bg-green-500' : 
                                company.status === 'inactive' ? 'bg-red-500' : 'bg-amber-500'
                              }`}></span>
                              {getStatusLabel(company.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                      onClick={() => handleViewDetails(company.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View details</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                      onClick={() => handleEdit(company)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit company</p>
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
                                      onClick={() => confirmDelete(company.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete company</p>
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
                                    onClick={() => handleAddClient(company.id)}
                                  >
                                    <UserPlus className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Add Client</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-indigo-50"
                                    onClick={() => handleAddService(company.id)}
                                  >
                                    <Shield className="mr-2 h-4 w-4 text-slate-500" />
                                    <span>Add Service</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-200" />
                                  <DropdownMenuItem 
                                    className="cursor-pointer flex items-center px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={() => confirmDelete(company.id)}
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
                      Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedAndFilteredCompanies.length}</span> of{' '}
                      <span className="font-medium">{companies.length}</span> companies
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
              {/* Active companies content - same structure as "all" tab */}
              {/* Content omitted for brevity as it would be identical to the "all" tab but filtered */}
            </Card>
          </TabsContent>
          
          <TabsContent value="inactive" className="m-0">
            <Card className="overflow-hidden border-slate-200">
              {/* Inactive companies content */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Company Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-lg bg-white border border-slate-200 shadow-2xl">
          <div className="absolute -top-12 left-0 right-0 mx-auto w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-white">
            <div className="bg-indigo-600 rounded-full p-5 text-white">
              <Building className="h-8 w-8" />
            </div>
          </div>
          
          <DialogHeader className="mt-10 space-y-3">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent text-center">
              {currentCompany.id ? 'Update Company Profile' : 'Register New Company'}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-center max-w-md mx-auto">
              {currentCompany.id 
                ? "Update company details with precision. Changes take effect immediately across the platform." 
                : "Define a new company profile to start managing its clients, teams, and services."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="space-y-5">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-white rounded-lg p-5">
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                    <Building className="h-4 w-4 inline mr-2" />
                    Company Name
                  </label>
                  <Input
                    id="name"
                    value={currentCompany.name || ''}
                    onChange={(e) => setCurrentCompany({...currentCompany, name: e.target.value})}
                    placeholder="e.g. Acme Corporation"
                    className="h-11 font-medium border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative bg-white rounded-lg p-5">
                  <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Address
                  </label>
                  <Textarea
                    id="address"
                    value={currentCompany.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCurrentCompany({...currentCompany, address: e.target.value})}
                    placeholder="Enter company address"
                    className="h-24 font-medium border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white rounded-lg p-5">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={currentCompany.email || ''}
                      onChange={(e) => setCurrentCompany({...currentCompany, email: e.target.value})}
                      placeholder="company@example.com"
                      className="h-11 font-medium border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative bg-white rounded-lg p-5">
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      value={currentCompany.phone || ''}
                      onChange={(e) => setCurrentCompany({...currentCompany, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      className="h-11 font-medium border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              
              {currentCompany.id && (
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative p-4 bg-white rounded-lg border border-amber-200 flex items-center">
                    <div className="mr-4 bg-amber-100 rounded-lg p-3">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-amber-800">Company Status</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Changing the company status will affect all associated clients, teams, and users.
                      </p>
                    </div>
                    <div className="ml-4">
                      <Select
                        value={currentCompany.status || 'active'}
                        onValueChange={(value) => setCurrentCompany({
                          ...currentCompany, 
                          status: value as StatusType
                        })}
                      >
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white shadow-md border border-slate-200">
                          <SelectItem value="active" className="flex items-center">
                            <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                            Active
                          </SelectItem>
                          <SelectItem value="inactive" className="flex items-center">
                            <span className="h-2 w-2 bg-red-500 rounded-full mr-2"></span>
                            Inactive
                          </SelectItem>
                          <SelectItem value="pending" className="flex items-center">
                            <span className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></span>
                            Pending
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
              className="w-full sm:w-auto order-2 sm:order-1 border-slate-300 hover:bg-slate-100"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCompany}
              disabled={!currentCompany.name}
              className="w-full sm:w-auto order-1 sm:order-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white shadow-lg shadow-indigo-500/20"
            >
              {currentCompany.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Company
                </>
              ) : (
                <>
                  <Building className="h-4 w-4 mr-2" />
                  Create Company
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-500">
              Are you sure you want to delete this company? This action cannot be undone, and all associated data could be affected.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Warning</h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Deleting a company will remove all associated records. This is only possible if there are no active clients, teams, or users associated with this company.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
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
