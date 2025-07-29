import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  FileText, 
  Building, 
  Mail, 
  Phone,
  Calendar,
  QrCode,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Users,
  Globe,
  Briefcase,
  Clock
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import api from '../../lib/api';

interface BriefingCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface BriefingTemplate {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  estimated_duration: string;
  price_range: string;
  questions: any[];
  required_fields: string[];
  form_settings: any;
  is_featured: boolean;
  briefing_category: BriefingCategory;
}

interface BriefingForm {
  template_id: number;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_position: string;
  company_website: string;
  company_size: string;
  industry: string;
  expires_at: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  referrer: string;
}

const BriefingGenerate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BriefingCategory[]>([]);
  const [templates, setTemplates] = useState<BriefingTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BriefingCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BriefingTemplate | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedBriefing, setGeneratedBriefing] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  
  const [form, setForm] = useState<BriefingForm>({
    template_id: 0,
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    contact_position: '',
    company_website: '',
    company_size: '',
    industry: '',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días por defecto
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    referrer: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [categoriesResponse, templatesResponse] = await Promise.all([
        api.get('/briefings/categories'),
        api.get('/briefings/templates')
      ]);
      
      if ((categoriesResponse.data as any).success) {
        setCategories((categoriesResponse.data as any).data);
      }
      
      if ((templatesResponse.data as any).success) {
        setTemplates((templatesResponse.data as any).data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      console.error('Error fetching data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field: keyof BriefingForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Si cambia el template, actualizar el template seleccionado
    if (field === 'template_id') {
      const template = templates.find(t => t.id === value);
      setSelectedTemplate(template || null);
    }
  };

  const handleCategorySelect = (category: BriefingCategory) => {
    setSelectedCategory(category);
    setActiveTab('templates');
  };

  const handleTemplateSelect = (template: BriefingTemplate) => {
    setSelectedTemplate(template);
    setForm(prev => ({ ...prev, template_id: template.id }));
    setActiveTab('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.template_id || !form.company_name || !form.contact_name || !form.contact_email) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/briefings/create', form);
      
      if ((response.data as any).success) {
        setGeneratedBriefing((response.data as any).data);
        setShowSuccess(true);
      } else {
        setError('Error al generar briefing');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar briefing');
      console.error('Error creating briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const getTemplatesByCategory = (categoryId: number) => {
    return templates.filter(t => t.category_id === categoryId);
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'bullhorn': FileText,
      'palette': FileText,
      'code': FileText,
      'tv': FileText,
      'video': FileText,
      'calendar': Calendar,
      'lightbulb': FileText,
      'users': Users
    };
    return iconMap[iconName] || FileText;
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/briefings')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Generar Briefing</h1>
            <p className="text-gray-600">Crea un formulario personalizado para que tu cliente lo complete</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">1. Categoría</TabsTrigger>
          <TabsTrigger value="templates" disabled={!selectedCategory}>2. Template</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedTemplate}>3. Detalles</TabsTrigger>
        </TabsList>

        {/* Paso 1: Selección de Categoría */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona una Categoría de Servicio</CardTitle>
              <CardDescription>
                Elige el tipo de proyecto para el cual necesitas información
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon);
                  return (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <CardContent className="p-6 text-center">
                        <div 
                          className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <IconComponent 
                            className="h-6 w-6" 
                            style={{ color: category.color }}
                          />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paso 2: Selección de Template */}
        <TabsContent value="templates" className="space-y-6">
          {selectedCategory && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: selectedCategory.color + '20' }}
                  >
                    {React.createElement(getIconComponent(selectedCategory.icon), {
                      className: "h-4 w-4",
                      style: { color: selectedCategory.color }
                    })}
                  </div>
                  <div>
                    <CardTitle>{selectedCategory.name}</CardTitle>
                    <CardDescription>{selectedCategory.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getTemplatesByCategory(selectedCategory.id).map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
                        template.is_featured ? 'border-yellow-300 bg-yellow-50' : 'hover:border-blue-300'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          {template.is_featured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Destacado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{template.estimated_duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span>{template.price_range}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Paso 3: Detalles del Cliente */}
        <TabsContent value="details" className="space-y-6">
          {selectedTemplate && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Template Seleccionado */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: selectedTemplate.briefing_category.color + '20' }}
                    >
                      {React.createElement(getIconComponent(selectedTemplate.briefing_category.icon), {
                        className: "h-4 w-4",
                        style: { color: selectedTemplate.briefing_category.color }
                      })}
                    </div>
                    <div>
                      <CardTitle>{selectedTemplate.name}</CardTitle>
                      <CardDescription>{selectedTemplate.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span><strong>Duración:</strong> {selectedTemplate.estimated_duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span><strong>Precio:</strong> {selectedTemplate.price_range}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span><strong>Preguntas:</strong> {selectedTemplate.questions.length} secciones</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Información del Cliente</span>
                  </CardTitle>
                  <CardDescription>
                    Datos básicos de la empresa y contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nombre de la Empresa *</Label>
                      <Input
                        id="company_name"
                        value={form.company_name}
                        onChange={(e) => handleChange('company_name', e.target.value)}
                        placeholder="Ej: Mi Empresa S.A."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Nombre del Contacto *</Label>
                      <Input
                        id="contact_name"
                        value={form.contact_name}
                        onChange={(e) => handleChange('contact_name', e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email de Contacto *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={form.contact_email}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                        placeholder="contacto@empresa.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Teléfono</Label>
                      <Input
                        id="contact_phone"
                        value={form.contact_phone}
                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_position">Cargo del Contacto</Label>
                      <Input
                        id="contact_position"
                        value={form.contact_position}
                        onChange={(e) => handleChange('contact_position', e.target.value)}
                        placeholder="Ej: Gerente de Marketing"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_website">Sitio Web</Label>
                      <Input
                        id="company_website"
                        type="url"
                        value={form.company_website}
                        onChange={(e) => handleChange('company_website', e.target.value)}
                        placeholder="https://www.ejemplo.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_size">Tamaño de la Empresa</Label>
                      <Select value={form.company_size} onValueChange={(value) => handleChange('company_size', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 empleados</SelectItem>
                          <SelectItem value="11-50">11-50 empleados</SelectItem>
                          <SelectItem value="51-200">51-200 empleados</SelectItem>
                          <SelectItem value="201-500">201-500 empleados</SelectItem>
                          <SelectItem value="500+">Más de 500 empleados</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industria/Sector</Label>
                      <Input
                        id="industry"
                        value={form.industry}
                        onChange={(e) => handleChange('industry', e.target.value)}
                        placeholder="Ej: Tecnología, Salud, Educación"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración del Formulario */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Configuración del Formulario</span>
                  </CardTitle>
                  <CardDescription>
                    Configura la duración y tracking del formulario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expires_at">Fecha de Expiración</Label>
                      <Input
                        id="expires_at"
                        type="date"
                        value={form.expires_at}
                        onChange={(e) => handleChange('expires_at', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="utm_source">Fuente de Tráfico (UTM)</Label>
                      <Input
                        id="utm_source"
                        value={form.utm_source}
                        onChange={(e) => handleChange('utm_source', e.target.value)}
                        placeholder="Ej: google, facebook, email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="utm_medium">Medio de Tráfico (UTM)</Label>
                      <Input
                        id="utm_medium"
                        value={form.utm_medium}
                        onChange={(e) => handleChange('utm_medium', e.target.value)}
                        placeholder="Ej: cpc, social, email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="utm_campaign">Campaña (UTM)</Label>
                      <Input
                        id="utm_campaign"
                        value={form.utm_campaign}
                        onChange={(e) => handleChange('utm_campaign', e.target.value)}
                        placeholder="Ej: q1_2024, summer_sale"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de envío */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading || !form.template_id || !form.company_name || !form.contact_name || !form.contact_email}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Generar Briefing
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de éxito */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span>¡Briefing Generado Exitosamente!</span>
            </DialogTitle>
            <DialogDescription>
              El formulario está listo para ser compartido con tu cliente
            </DialogDescription>
          </DialogHeader>
          
          {generatedBriefing && (
            <div className="space-y-4">
              {/* Información del briefing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información del Cliente</h4>
                  <p className="text-sm text-blue-700"><strong>Empresa:</strong> {generatedBriefing.company_name}</p>
                  <p className="text-sm text-blue-700"><strong>Contacto:</strong> {generatedBriefing.contact_name}</p>
                  <p className="text-sm text-blue-700"><strong>Email:</strong> {generatedBriefing.contact_email}</p>
                  {generatedBriefing.contact_phone && (
                    <p className="text-sm text-blue-700"><strong>Teléfono:</strong> {generatedBriefing.contact_phone}</p>
                  )}
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Detalles del Formulario</h4>
                  <p className="text-sm text-green-700"><strong>URL:</strong> {generatedBriefing.public_url}</p>
                  <p className="text-sm text-green-700"><strong>Expira:</strong> {new Date(generatedBriefing.expires_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* URL y QR Code */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label className="font-medium">URL del Formulario:</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedBriefing.public_url)}
                    className="flex items-center space-x-1"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar URL'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInNewTab(generatedBriefing.public_url)}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Abrir</span>
                  </Button>
                </div>

                {/* QR Code */}
                {generatedBriefing.qr_code_url && (
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Código QR</h4>
                    <div className="inline-block p-4 bg-white border rounded-lg">
                      <img 
                        src={generatedBriefing.qr_code_url} 
                        alt="QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Escanea este código para acceder al formulario
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSuccess(false);
                    setGeneratedBriefing(null);
                    setSelectedCategory(null);
                    setSelectedTemplate(null);
                    setActiveTab('categories');
                    setForm({
                      template_id: 0,
                      company_name: '',
                      contact_name: '',
                      contact_email: '',
                      contact_phone: '',
                      contact_position: '',
                      company_website: '',
                      company_size: '',
                      industry: '',
                      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      utm_source: '',
                      utm_medium: '',
                      utm_campaign: '',
                      referrer: ''
                    });
                  }}
                >
                  Generar Otro
                </Button>
                <Button
                  onClick={() => navigate('/dashboard/briefings')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Ver Todos los Briefings
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BriefingGenerate; 