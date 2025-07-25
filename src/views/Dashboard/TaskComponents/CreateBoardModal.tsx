import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Folder, Loader2, Sparkles, Building2 } from 'lucide-react';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

interface Company {
  id: number;
  name: string;
}

interface CreateBoardModalProps {
  onCreateBoard: (boardData: { name: string; description?: string; company_id: number }) => void;
  onClose: () => void;
}

export default function CreateBoardModal({ onCreateBoard, onClose }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Cargar las empresas al montar el componente
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Usar el cliente API centralizado que maneja automáticamente la URL base y autenticación
        const response = await api.get('/companies');
        
        // Verificar la estructura de la respuesta y extraer los datos de las empresas
        const responseData = response.data as any;
        if (responseData && responseData.data) {
          setCompanies(responseData.data);
        } else if (Array.isArray(responseData)) {
          setCompanies(responseData);
        } else {
          console.error('Formato de respuesta inesperado:', responseData);
          setCompanies([]);
        }
      } catch (error) {
        console.error('Error al cargar empresas:', error);
        setCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };
    
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !companyId) return;

    setLoading(true);
    try {
      await onCreateBoard({ 
        name: name.trim(), 
        description: description.trim() || undefined,
        company_id: companyId 
      });
      // Limpiar formulario después de crear
      setName('');
      setDescription('');
      setCompanyId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Limpiar formulario al cerrar
    setName('');
    setDescription('');
    setCompanyId(null);
    onClose();
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <DialogContent className="sm:max-w-md bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 border-blue-700/50 text-white shadow-2xl shadow-blue-500/20 backdrop-blur-sm">
      <DialogHeader className="space-y-3">
        <motion.div 
          className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Folder className="w-8 h-8 text-white" />
        </motion.div>
        <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Crear Nuevo Tablero
        </DialogTitle>
        <motion.div 
          className="flex items-center justify-center space-x-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Organiza tus proyectos de manera eficiente</span>
          <Sparkles className="w-4 h-4 text-purple-400" />
        </motion.div>
      </DialogHeader>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6 mt-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="name" className="text-blue-300 flex items-center space-x-2">
            <span>Nombre del Tablero</span>
            <span className="text-pink-400">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Proyecto Web, Marketing 2024..."
            required
            autoFocus
            className="bg-white/10 border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder:text-blue-200 backdrop-blur-sm transition-all duration-300"
          />
        </motion.div>
        
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="company" className="text-blue-300 flex items-center space-x-2">
            <span>Empresa</span>
            <span className="text-pink-400">*</span>
          </Label>
          <Select 
            value={companyId?.toString() || ''} 
            onValueChange={(value) => setCompanyId(Number(value))}
          >
            <SelectTrigger 
              className="bg-white/10 border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder:text-blue-200 backdrop-blur-sm transition-all duration-300"
            >
              <SelectValue placeholder="Selecciona una empresa" />
            </SelectTrigger>
            <SelectContent>
              {loadingCompanies ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Cargando empresas...</span>
                </div>
              ) : companies.length > 0 ? (
                companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                      {company.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">
                  No hay empresas disponibles
                </div>
              )}
            </SelectContent>
          </Select>
        </motion.div>
        
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="description" className="text-blue-300">
            Descripción
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el propósito de este tablero..."
            rows={3}
            className="bg-white/10 border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder:text-blue-200 backdrop-blur-sm transition-all duration-300 resize-none"
          />
        </motion.div>
        
        <motion.div 
          className="flex justify-end space-x-3 pt-4"
          variants={itemVariants}
        >
          <Button 
            type="button" 
            variant="ghost" 
            onClick={handleClose}
            className="text-blue-300 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !name.trim() || !companyId}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Creando...' : 'Crear Tablero'}
          </Button>
        </motion.div>
      </motion.form>
    </DialogContent>
  );
} 