import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MoreHorizontal, Search, Filter, Calendar, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogTrigger } from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import Board from './TaskComponents/Board';
import CreateBoardModal from './TaskComponents/CreateBoardModal';

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

export default function TaskPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tasks/boards', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBoards(response.data);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (boardData: { name: string; description?: string }) => {
    try {
      const response = await axios.post('http://localhost:3000/api/tasks/boards', boardData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBoards([response.data, ...boards]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedBoard) {
    return (
      <Board 
        board={selectedBoard} 
        onBack={() => setSelectedBoard(null)}
        onBoardUpdate={fetchBoards}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">Gestiona tus proyectos y tareas</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tablero
            </Button>
          </DialogTrigger>
          <CreateBoardModal 
            onCreateBoard={handleCreateBoard}
            onClose={() => setShowCreateModal(false)}
          />
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar tableros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tableros</h3>
          <p className="text-gray-600 mb-4">Crea tu primer tablero para comenzar a organizar tus tareas</p>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Crear Tablero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map((board) => (
            <Card 
              key={board.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setSelectedBoard(board)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {board.name}
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                {board.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {board.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{board.lists?.reduce((acc, list) => acc + (list.cards?.length || 0), 0) || 0} tareas</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {board.labels?.slice(0, 3).map((label) => (
                      <div
                        key={label.id}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                    ))}
                    {board.labels?.length > 3 && (
                      <span className="text-xs">+{board.labels.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-xs">
                        {board.created_by_user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">
                      {board.created_by_user?.username}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(board.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 