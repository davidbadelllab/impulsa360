import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Loader2, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { cn } from '../../../lib/utils';

interface CreateCardModalProps {
  onCreateCard: (cardData: { title: string; description?: string; due_date?: string; labels?: number[]; assignedUsers?: number[] }) => void;
  onClose: () => void;
  boardLabels: Label[];
  open: boolean;
}

interface Label {
  id: number;
  name: string;
  color: string;
  board_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function CreateCardModal({ onCreateCard, onClose, boardLabels, open }: CreateCardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:3000/api/tasks/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreateCard({ 
        title: title.trim(), 
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        labels: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
        assignedUsers: selectedUserIds.length > 0 ? selectedUserIds : undefined,
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setSelectedLabelIds([]);
    setSelectedUserIds([]);
    onClose();
  };

  const toggleLabel = (labelId: number) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const toggleUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-900 to-black border-slate-700 text-white shadow-2xl shadow-purple-500/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Crear Nueva Tarjeta
          </DialogTitle>
        </DialogHeader>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="title" className="text-slate-400">Título de la Tarjeta *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar login"
              required
              autoFocus
              className="bg-slate-800 border-slate-600 focus:ring-purple-500 focus:border-purple-500 text-white placeholder:text-slate-500"
            />
          </motion.div>

          {/* Description */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="description" className="text-slate-400">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la tarea..."
              rows={3}
              className="bg-slate-800 border-slate-600 focus:ring-purple-500 focus:border-purple-500 text-white placeholder:text-slate-500"
            />
          </motion.div>

          {/* Due Date */}
          <motion.div className="space-y-2" variants={itemVariants}>
            <Label htmlFor="dueDate" className="text-slate-400">Fecha de Vencimiento</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-800 border-slate-600 focus:ring-purple-500 focus:border-purple-500 text-white"
            />
          </motion.div>

          {/* Labels */}
          {boardLabels && boardLabels.length > 0 && (
            <motion.div className="space-y-3" variants={itemVariants}>
              <Label className="text-slate-400 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Etiquetas
              </Label>
              <div className="flex flex-wrap gap-2">
                {boardLabels.map(label => (
                  <motion.button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-full transition-all duration-200 flex items-center gap-2 border',
                      selectedLabelIds.includes(label.id)
                        ? 'shadow-lg shadow-purple-500/20'
                        : 'border-transparent hover:bg-opacity-10'
                    )}
                    style={{ 
                      backgroundColor: `${label.color}30`,
                      borderColor: selectedLabelIds.includes(label.id) ? label.color : 'transparent'
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: label.color }}></span>
                    {label.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* User Assignment */}
          <motion.div className="space-y-3" variants={itemVariants}>
            <Label className="text-slate-400 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Asignar a
            </Label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {users.map(user => (
                  <motion.button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user.id)}
                    className={cn(
                      'px-3 py-2 text-xs rounded-full transition-all duration-200 flex items-center gap-2 border',
                      selectedUserIds.includes(user.id)
                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                    )}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.username}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Submit Buttons */}
          <motion.div className="flex justify-end space-x-3 pt-4" variants={itemVariants}>
            <Button type="button" variant="ghost" onClick={handleClose} className="text-slate-400 hover:bg-slate-700 hover:text-white">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !title.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/40"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creando...' : 'Crear Tarjeta'}
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
} 