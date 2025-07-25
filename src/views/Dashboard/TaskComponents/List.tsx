import React, { useState } from 'react';
import { MoreHorizontal, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import api from '../../../lib/api';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

interface List {
  id: number;
  name: string;
  board_id: number;
  position: number;
  is_archived: boolean;
  cards: Card[];
}

interface Card {
  id: number;
  title: string;
  description?: string;
  list_id: number;
  position: number;
  due_date?: string;
  is_archived: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  labels: CardLabel[];
  assignments: CardAssignment[];
  comments: Comment[];
  checklists: Checklist[];
  attachments: Attachment[];
}

interface Label {
  id: number;
  name: string;
  color: string;
  board_id: number;
}

interface CardLabel {
  label: Label;
}

interface CardAssignment {
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface Comment {
  id: number;
  content: string;
  card_id: number;
  user_id: number;
  created_at: string;
  user: {
    username: string;
    email: string;
  };
}

interface Checklist {
  id: number;
  title: string;
  card_id: number;
  position: number;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: number;
  title: string;
  is_completed: boolean;
  checklist_id: number;
  position: number;
}

interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  card_id: number;
  uploaded_by: number;
}

interface ListProps {
  list: List;
  boardLabels: Label[];
  onUpdate: () => void;
  onCreateCard: () => void;
}

export default function List({ list, boardLabels, onUpdate, onCreateCard }: ListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(list.name);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    setNodeRef,
    isOver,
  } = useDroppable({
    id: `list-${list.id}`,
  });

  const sortedCards = list.cards?.sort((a, b) => a.position - b.position) || [];

  const handleSaveEdit = async () => {
    if (!editedName.trim() || editedName === list.name) {
      setIsEditing(false);
      setEditedName(list.name);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/tasks/lists/${list.id}`, {
        name: editedName.trim()
      });

      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating list:', error);
      setEditedName(list.name);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async () => {
    setLoading(true);
    try {
      await api.delete(`/tasks/lists/${list.id}`);
      
      onUpdate();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting list:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-shrink-0 w-80">
      <Card 
        ref={setNodeRef}
        className={`h-fit ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditedName(list.name);
                    }
                  }}
                  className="text-sm font-medium"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="px-2"
                >
                  {loading ? '...' : '✓'}
                </Button>
              </div>
            ) : (
              <>
                <CardTitle className="text-sm font-medium text-gray-900">
                  {list.name}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {sortedCards.length}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {sortedCards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              boardLabels={boardLabels}
              onUpdate={onUpdate}
            />
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900 text-sm"
            onClick={onCreateCard}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Tarjeta
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar lista?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Se eliminará la lista "{list.name}" y todas sus tarjetas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteList}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 