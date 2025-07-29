import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
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

  const briefingTypes = [
    { value: 'Diseño', label: 'Diseño' },
    { value: 'Programación', label: 'Programación' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Consultoría', label: 'Consultoría' },
    { value: 'Otro', label: 'Otro' }
  ];

  const categories = [
    { value: 'Sistemas', label: 'Sistemas' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Frontend', label: 'Frontend' },
    { value: 'Mobile', label: 'Mobile' },
    { value: 'SEO', label: 'SEO' },
    { value: 'Redes Sociales', label: 'Redes Sociales' },
    { value: 'Branding', label: 'Branding' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Cargar empresas al montar el componente
  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies((response.data as any).data || []);
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

      if ((response.data as any).success) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/briefings')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Briefing</h1>
            <p className="text-gray-600 mt-1">Define los detalles del nuevo briefing</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Información del Briefing</span>
            </CardTitle>
            <CardDescription>
              Detalles principales del briefing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="title">Título del Proyecto</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Rediseño de sitio web corporativo"
              />
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
              rows={6}
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
            disabled={loading || !form.type || !form.title}
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