import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle,
  AlertCircle,
  Loader,
  Send,
  Building,
  Mail,
  FileText,
  Calendar
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
  Checkbox
} from "../../components/ui/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../components/ui/radio-group";
import api from '../../lib/api';

interface BriefingData {
  id: number;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  status: string;
  expires_at: string;
  submitted_at?: string;
  briefingtemplate: {
    name: string;
    type: string;
    category: string;
    description: string;
    questions: any[];
  };
}

const PublicBriefingForm: React.FC = () => {
  const { publicUrl } = useParams<{ publicUrl: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [responses, setResponses] = useState<any>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (publicUrl) {
      fetchBriefing();
    }
  }, [publicUrl]);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/briefings/public/${publicUrl}`);
      
      if ((response.data as any).success) {
        const data = (response.data as any).data;
        setBriefing(data);
        
        // Inicializar respuestas vacías
        const initialResponses: any = {};
        data.briefingtemplate.questions.forEach((section: any) => {
          section.questions.forEach((question: any) => {
            if (question.type === 'checkbox') {
              initialResponses[question.id] = [];
            } else {
              initialResponses[question.id] = '';
            }
          });
        });
        setResponses(initialResponses);
      } else {
        setError('Error al cargar el formulario');
      }
    } catch (err: any) {
      if (err.response?.status === 410) {
        setError('Este formulario ha expirado');
      } else if (err.response?.status === 404) {
        setError('Formulario no encontrado');
      } else {
        setError(err.response?.data?.message || 'Error al cargar el formulario');
      }
      console.error('Error fetching briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((item: string) => item !== option)
        };
      }
    });
  };

  const validateForm = () => {
    if (!briefing) return false;
    
    for (const section of briefing.briefingtemplate.questions) {
      for (const question of section.questions) {
        if (question.required) {
          const value = responses[question.id];
          if (question.type === 'checkbox') {
            if (!value || value.length === 0) return false;
          } else {
            if (!value || value.trim() === '') return false;
          }
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await api.post(`/briefings/public/${publicUrl}/submit`, {
        responses
      });
      
      if ((response.data as any).success) {
        setShowSuccess(true);
      } else {
        setError('Error al enviar el formulario');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el formulario');
      console.error('Error submitting briefing:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: any) => {
    const value = responses[question.id] || '';

    switch (question.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            required={question.required}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {question.options.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => handleResponseChange(question.id, val)}>
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = value || [];
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(question.id, option, checked as boolean)
                  }
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.close()}>
            Cerrar
          </Button>
        </div>
      </div>
    );
  }

  if (!briefing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Briefing - {briefing.company_name}</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {briefing.briefingtemplate.description}
          </p>
        </div>

        {/* Información del formulario */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <span><strong>Tipo:</strong> {briefing.briefingtemplate.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span><strong>Expira:</strong> {new Date(briefing.expires_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span><strong>Contacto:</strong> {briefing.contact_email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {briefing.briefingtemplate.questions.map((section: any, sectionIndex: number) => (
            <Card key={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                    {sectionIndex + 1}
                  </span>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question: any) => (
                  <div key={question.id} className="space-y-2">
                    <Label htmlFor={question.id} className="text-base font-medium">
                      {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Botón de envío */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={submitting || !validateForm()}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-8"
            >
              {submitting ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Briefing
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Modal de éxito */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Formulario Enviado!</h2>
              <p className="text-gray-600 mb-6">
                Gracias por completar el briefing. Nos pondremos en contacto contigo pronto.
              </p>
              <Button onClick={() => window.close()}>
                Cerrar
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicBriefingForm; 