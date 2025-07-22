import React, { useState } from 'react';
import { Calendar, MessageSquare, Paperclip, CheckSquare, Users } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { AnimatePresence } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import CardDetailModal from './CardDetailModal';

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

interface TaskCardProps {
  card: Card;
  boardLabels: Label[];
  onUpdate: () => void;
}

export default function TaskCard({ card, boardLabels, onUpdate }: TaskCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const isOverdue = card.due_date && new Date(card.due_date) < new Date();
  const totalChecklistItems = card.checklists?.reduce((acc, checklist) => acc + checklist.items.length, 0) || 0;
  const completedChecklistItems = card.checklists?.reduce((acc, checklist) => 
    acc + checklist.items.filter(item => item.is_completed).length, 0) || 0;

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={`cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white ${
          isDragging ? 'opacity-50 rotate-3 scale-105' : ''
        }`}
        {...listeners}
        {...attributes}
        onClick={() => {
          // Solo abrir modal si no está siendo arrastrado
          if (!isDragging) {
            setShowDetailModal(true);
          }
        }}
      >
        <CardContent className="p-3 space-y-2">
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.slice(0, 3).map((cardLabel) => (
                <div
                  key={cardLabel.label.id}
                  className="w-3 h-2 rounded-sm"
                  style={{ backgroundColor: cardLabel.label.color }}
                />
              ))}
              {card.labels.length > 3 && (
                <span className="text-xs text-gray-500">+{card.labels.length - 3}</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {card.title}
          </h3>

          {/* Description */}
          {card.description && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {card.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {/* Due date */}
              {card.due_date && (
                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-500' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(card.due_date).toLocaleDateString()}</span>
                </div>
              )}

              {/* Comments */}
              {card.comments && card.comments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{card.comments.length}</span>
                </div>
              )}

              {/* Attachments */}
              {card.attachments && card.attachments.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="w-3 h-3" />
                  <span>{card.attachments.length}</span>
                </div>
              )}

              {/* Checklists */}
              {totalChecklistItems > 0 && (
                <div className="flex items-center space-x-1">
                  <CheckSquare className="w-3 h-3" />
                  <span>{completedChecklistItems}/{totalChecklistItems}</span>
                </div>
              )}
            </div>

            {/* Assignments */}
            {card.assignments && card.assignments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <div className="flex -space-x-1">
                  {card.assignments.slice(0, 3).map((assignment) => (
                    <Avatar key={assignment.user.id} className="w-5 h-5 border border-white">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {assignment.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {card.assignments.length > 3 && (
                    <span className="text-xs">+{card.assignments.length - 3}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showDetailModal && (
          <CardDetailModal
            card={card}
            boardLabels={boardLabels}
            onUpdate={onUpdate}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
} 