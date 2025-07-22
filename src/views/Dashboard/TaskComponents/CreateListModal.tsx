import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { List, Loader2, Sparkles, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';

interface CreateListModalProps {
  onCreateList: (listData: { name: string }) => void;
  onClose: () => void;
  open: boolean;
}

export default function CreateListModal({ onCreateList, onClose, open }: CreateListModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreateList({ name: name.trim() });
      setName(''); // Limpiar el formulario después de crear
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName(''); // Limpiar el formulario al cerrar
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 border-emerald-700/50 text-white shadow-2xl shadow-emerald-500/20 backdrop-blur-sm">
        <DialogHeader className="space-y-3">
          <motion.div 
            className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <List className="w-8 h-8 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Crear Nueva Lista
          </DialogTitle>
          <motion.div 
            className="flex items-center justify-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Organiza tus tareas por etapas</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
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
            <Label htmlFor="name" className="text-emerald-300 flex items-center space-x-2">
              <span>Nombre de la Lista</span>
              <span className="text-cyan-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: En Progreso, Revisión, Terminado..."
              required
              autoFocus
              className="bg-white/10 border-emerald-500/30 focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-white placeholder:text-emerald-200 backdrop-blur-sm transition-all duration-300"
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
              className="text-emerald-300 hover:bg-white/10 hover:text-white transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !name.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-105"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Lista'}
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
} 