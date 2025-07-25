import React, { useState } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, Search, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardContent } from '../../../components/ui/card';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import List from './List';
import CreateListModal from './CreateListModal';
import CreateCardModal from './CreateCardModal';
import TaskCard from './TaskCard';
import api from '../../../lib/api';

interface Board {
  id: number;
  name: string;
  description?: string;
  company_id?: number;
  created_by: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  lists: List[];
  labels: Label[];
  created_by_user: {
    username: string;
    email: string;
  };
}

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

interface BoardProps {
  board: Board;
  onBack: () => void;
  onBoardUpdate: () => void;
}

export default function Board({ board, onBack, onBoardUpdate }: BoardProps) {
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedLists = board.lists?.sort((a, b) => a.position - b.position) || [];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as number;
    
    // Encontrar la tarjeta activa
    const card = sortedLists
      .flatMap(list => list.cards || [])
      .find(card => card.id === cardId);
    
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('=== DRAG END EVENT ===');
    console.log('Active:', active);
    console.log('Over:', over);
    
    if (!over) {
      console.log('No over target, ending drag');
      setActiveCard(null);
      return;
    }

    const cardId = Number(active.id);
    const overId = over.id;

    console.log('Card ID:', cardId, 'Over ID:', overId);

    // Validar que cardId sea un número válido
    if (isNaN(cardId) || cardId <= 0) {
      console.error('Invalid cardId:', active.id);
      setActiveCard(null);
      return;
    }

    // Si se suelta sobre una lista
    if (typeof overId === 'string' && overId.startsWith('list-')) {
      const newListId = parseInt(overId.replace('list-', ''));
      const newList = sortedLists.find(list => list.id === newListId);
      
      console.log('Available lists:', sortedLists.map(l => ({ id: l.id, name: l.name })));
      console.log('Target list ID:', newListId);
      console.log('Found list:', newList);
      
      if (newList) {
        const newPosition = newList.cards?.length || 0;
        
        console.log('Moving card:', { cardId, newListId, newPosition });
        console.log('Request payload:', {
          cardId,
          newListId,
          newPosition
        });
        
        try {
          const result = await api.put('/tasks/cards/move', {
            cardId,
            newListId,
            newPosition
          });
          
          console.log('Card moved successfully:', result);
          onBoardUpdate();
        } catch (error) {
          console.error('Error moving card:', error);
          alert('Error al mover la tarjeta: ' + error.message);
        }
      } else {
        console.error('List not found for ID:', newListId);
        alert('Error: Lista destino no encontrada');
      }
    } else {
      console.log('Not dropping on a list, overId:', overId);
    }
    
    setActiveCard(null);
  };

  const handleCreateList = async (listData: { name: string }) => {
    try {
      await api.post('/tasks/lists', {
        ...listData,
        board_id: board.id,
        position: sortedLists.length
      });

      onBoardUpdate();
      setShowCreateListModal(false);
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const handleCreateCard = async (cardData: { title: string; description?: string; due_date?: string; labels?: number[]; assignedUsers?: number[] }) => {
    if (!selectedListId) return;

    try {
      const newCard = await api.post('/tasks/cards', {
        ...cardData,
        list_id: selectedListId,
        position: board.lists?.find(l => l.id === selectedListId)?.cards?.length || 0
      });
        
        // Si hay etiquetas seleccionadas, asignarlas a la tarjeta
        if (cardData.labels && cardData.labels.length > 0) {
          for (const labelId of cardData.labels) {
            await api.post('/tasks/card-labels', {
              card_id: newCard.id,
              label_id: labelId
            });
          }
        }

        // Si hay usuarios asignados, asignarlos a la tarjeta
        if (cardData.assignedUsers && cardData.assignedUsers.length > 0) {
          for (const userId of cardData.assignedUsers) {
            await api.post('/tasks/assignments', {
              card_id: newCard.id,
              user_id: userId
            });
          }
        }
        
        onBoardUpdate();
        setShowCreateCardModal(false);
        setSelectedListId(null);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
                {board.description && (
                  <p className="text-sm text-gray-600">{board.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar tarjetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex space-x-6 h-full">
            {sortedLists.map((list) => (
              <List
                key={list.id}
                list={list}
                boardLabels={board.labels}
                onUpdate={onBoardUpdate}
                onCreateCard={() => {
                  setSelectedListId(list.id);
                  setShowCreateCardModal(true);
                }}
              />
            ))}
            
            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <Card className="h-fit">
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                    onClick={() => setShowCreateListModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Lista
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <TaskCard
              card={activeCard}
              boardLabels={board.labels}
              onUpdate={onBoardUpdate}
            />
          ) : null}
        </DragOverlay>

        {/* Modals */}
        <CreateListModal
          open={showCreateListModal}
          onCreateList={handleCreateList}
          onClose={() => setShowCreateListModal(false)}
        />

        <CreateCardModal
          open={showCreateCardModal && selectedListId !== null}
          onCreateCard={handleCreateCard}
          onClose={() => {
            setShowCreateCardModal(false);
            setSelectedListId(null);
          }}
          boardLabels={board.labels}
        />
      </div>
    </DndContext>
  );
} 