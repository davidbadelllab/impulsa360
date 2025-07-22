import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Search,
  Download,
  Share2,
  Trash2,
  File,
  Folder,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import FilePreview from '../../components/FilePreview';

interface FileItem {
  id: number;
  name: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  folder_id?: number;
}

interface FolderItem {
  id: number;
  name: string;
  created_at: string;
  parent_id?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function MediaPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [sharedFolders, setSharedFolders] = useState<any[]>([]);
  const [sharedFiles, setSharedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareItem, setShareItem] = useState<{ type: 'file' | 'folder', id: number } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissionType, setPermissionType] = useState<'read' | 'write' | 'admin'>('read');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMediaItems();
    loadUsers();
  }, [currentFolder]);

  const loadMediaItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/media/items${currentFolder ? `?folderId=${currentFolder}` : ''}`);
      setFolders(response.data.folders || []);
      setFiles(response.data.files || []);
      setSharedFolders(response.data.sharedFolders || []);
      setSharedFiles(response.data.sharedFiles || []);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/media/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) {
      formData.append('folderId', currentFolder.toString());
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        loadMediaItems();
      }, 1000);
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await api.post('/media/folder', {
        name: newFolderName,
        parentId: currentFolder
      });
      setNewFolderName('');
      setShowCreateFolder(false);
      loadMediaItems();
    } catch (error) {
      console.error('Error creando carpeta:', error);
    }
  };

  const deleteItem = async (type: 'file' | 'folder', id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;

    try {
      await api.delete(`/media/${type}/${id}`);
      loadMediaItems();
    } catch (error) {
      console.error('Error eliminando elemento:', error);
    }
  };

  const handleShareItem = async () => {
    if (!shareItem || !selectedUser) return;

    try {
      await api.post(`/media/share/${shareItem.type}`, {
        [`${shareItem.type}Id`]: shareItem.id,
        sharedWithUserId: parseInt(selectedUser),
        permissionType
      });
      setShowShareDialog(false);
      setShareItem(null);
      setSelectedUser('');
      setPermissionType('read');
    } catch (error) {
      console.error('Error compartiendo elemento:', error);
    }
  };

  const downloadFile = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/media/download/${fileId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando archivo:', error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="w-6 h-6" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Media Manager</h1>
          <p className="text-gray-600">Gestiona tus archivos y carpetas</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir archivo
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowCreateFolder(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Nueva carpeta
          </Button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar archivos y carpetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Progreso de subida */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Subiendo archivo...</span>
              <span className="text-sm text-blue-700">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Carpetas */}
              {filteredFolders.map((folder) => (
                <motion.div
                  key={`folder-${folder.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onDoubleClick={() => setCurrentFolder(folder.id)}
                  >
                    <div className="flex flex-col items-center">
                      <Folder className="w-12 h-12 text-blue-500 mb-2" />
                      <span className="text-sm font-medium text-center truncate w-full">
                        {folder.name}
                      </span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        setShareItem({ type: 'folder', id: folder.id });
                        setShowShareDialog(true);
                      }}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteItem('folder', folder.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}

              {/* Archivos */}
              {filteredFiles.map((file) => (
                <motion.div
                  key={`file-${file.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                      <div 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => {
                      setPreviewFile(file);
                      setShowPreview(true);
                    }}
                  >
                    {getFileIcon(file.mime_type)}
                    <span className="text-sm font-medium text-center truncate w-full mt-2">
                      {file.original_name}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.file_size)}
                    </span>
                  </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => downloadFile(file.id, file.original_name)}>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setShareItem({ type: 'file', id: file.id });
                        setShowShareDialog(true);
                      }}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartir
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteItem('file', file.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="col-span-6">Nombre</div>
                <div className="col-span-2">Tamaño</div>
                <div className="col-span-3">Modificado</div>
                <div className="col-span-1">Acciones</div>
              </div>
              
              {/* Carpetas */}
              {filteredFolders.map((folder) => (
                <div
                  key={`folder-${folder.id}`}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onDoubleClick={() => setCurrentFolder(folder.id)}
                >
                  <div className="col-span-6 flex items-center">
                    <Folder className="w-5 h-5 text-blue-500 mr-3" />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">-</div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {new Date(folder.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setShareItem({ type: 'folder', id: folder.id });
                          setShowShareDialog(true);
                        }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteItem('folder', folder.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {/* Archivos */}
              {filteredFiles.map((file) => (
                <div
                  key={`file-${file.id}`}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setPreviewFile(file);
                    setShowPreview(true);
                  }}
                >
                  <div className="col-span-6 flex items-center">
                    {getFileIcon(file.mime_type)}
                    <span className="ml-3">{file.original_name}</span>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {formatFileSize(file.file_size)}
                  </div>
                  <div className="col-span-3 text-sm text-gray-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </div>
                  <div className="col-span-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => downloadFile(file.id, file.original_name)}>
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setShareItem({ type: 'file', id: file.id });
                          setShowShareDialog(true);
                        }}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Compartir
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteItem('file', file.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay elementos */}
          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay archivos</h3>
              <p className="text-gray-500">Sube tu primer archivo o crea una carpeta para comenzar</p>
            </div>
          )}
        </div>
      )}

      {/* Input oculto para subir archivos */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileUpload}
        multiple={false}
      />

      {/* Dialog para crear carpeta */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva carpeta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nombre de la carpeta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
                Cancelar
              </Button>
              <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                Crear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para compartir */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartir {shareItem?.type === 'file' ? 'archivo' : 'carpeta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Usuario</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Permisos</label>
              <Select value={permissionType} onValueChange={(value: 'read' | 'write' | 'admin') => setPermissionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Solo lectura</SelectItem>
                  <SelectItem value="write">Lectura y escritura</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleShareItem} disabled={!selectedUser}>
                Compartir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreview
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewFile(null);
        }}
        file={previewFile}
      />
    </div>
  );
} 