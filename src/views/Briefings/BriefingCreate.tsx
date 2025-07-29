import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Building, 
  Users, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import api from '../../lib/api';

interface BriefingForm {
  type: string;
  category: string;
  title: string;
  description: string;
  company_id?: number;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
}

const BriefingCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [form, setForm] = useState<BriefingForm>({
    type: '',
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  // Cargar empresas al montar el componente
  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/briefings', {
        ...form,
        status: 'pending',
        is_read: false
      });

      if (response.data.success) {
        navigate('/dashboard/briefings');
      } else {
        setError('Error al crear el briefing');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el briefing');
      console.error('Error creating briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BriefingForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const briefingTypes = [
    { value: 'marketing', label: 'Marketing Digital' },
    { value: 'development', label: 'Desarrollo Web' },
    { value: 'design', label: 'Diseño Gráfico' },
    { value: 'consulting', label: 'Consultoría' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'other', label: 'Otro' }
  ];

  const categories = [
    { value: 'website', label: 'Sitio Web' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'social_media', label: 'Redes Sociales' },
    { value: 'seo', label: 'SEO' },
    { value: 'ads', label: 'Publicidad' },
    { value: 'branding', label: 'Branding' },
    { value: 'app', label: 'Aplicación Móvil' },
    { value: 'other', label: 'Otro' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard/briefings')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Briefing</h1>
            <p className="text-gray-600">Define los detalles del nuevo proyecto</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Información Básica</span>
              </CardTitle>
              <CardDescription>
                Detalles principales del briefing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Proyecto *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ej: Rediseño de sitio web corporativo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Proyecto *</Label>
                <Select value={form.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {briefingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={form.category} onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={form.priority} onValueChange={(value: any) => handleChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Detalles Adicionales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Detalles Adicionales</span>
              </CardTitle>
              <CardDescription>
                Información complementaria del proyecto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa (Opcional)</Label>
                <Select value={form.company_id?.toString() || ''} onValueChange={(value) => handleChange('company_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Fecha de Entrega</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descripción */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Descripción del Proyecto</span>
            </CardTitle>
            <CardDescription>
              Describe detalladamente los requerimientos y objetivos del proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe los objetivos, requerimientos, público objetivo, características específicas, y cualquier otra información relevante para el proyecto..."
              rows={8}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/briefings')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !form.title || !form.type}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Crear Briefing
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default BriefingCreate; 