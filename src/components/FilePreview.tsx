import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  Image as ImageIcon,
  File,
  Video,
  Music
} from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: number;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
  } | null;
  onDownload?: (fileId: number, fileName: string) => void;
}

export default function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!file) return null;

  const isImage = file.mime_type.startsWith('image/');
  const isPDF = file.mime_type === 'application/pdf';
  const isVideo = file.mime_type.startsWith('video/');
  const isAudio = file.mime_type.startsWith('audio/');
  const isDocument = file.mime_type.includes('document') || 
                    file.mime_type.includes('word') || 
                    file.mime_type.includes('excel') || 
                    file.mime_type.includes('powerpoint') ||
                    file.mime_type.includes('sheet') ||
                    file.mime_type.includes('presentation');

  const fileUrl = `/api/media/download/${file.id}`;
  const downloadUrl = `/api/media/download/${file.id}?download=true`;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="w-16 h-16 text-blue-500" />;
    if (isPDF) return <FileText className="w-16 h-16 text-red-500" />;
    if (isVideo) return <Video className="w-16 h-16 text-purple-500" />;
    if (isAudio) return <Music className="w-16 h-16 text-green-500" />;
    if (isDocument) return <FileText className="w-16 h-16 text-blue-600" />;
    return <File className="w-16 h-16 text-gray-500" />;
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center w-full h-full min-h-0 overflow-hidden">
          <img
            src={fileUrl}
            alt={file.original_name}
            className="w-full h-full object-contain transition-transform duration-200"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="w-full h-full">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full border-none"
            title={file.original_name}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full">
          <video
            src={fileUrl}
            controls
            className="max-w-full max-h-full"
            onLoadedData={() => setIsLoading(false)}
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Music className="w-24 h-24 text-green-500" />
          <h3 className="text-lg font-medium text-gray-900">{file.original_name}</h3>
          <audio
            src={fileUrl}
            controls
            className="w-full max-w-md"
            onLoadedData={() => setIsLoading(false)}
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      );
    }

    if (isDocument) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          {getFileIcon()}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{file.original_name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Este tipo de archivo no se puede previsualizar en el navegador
            </p>
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Descargar para ver
            </Button>
          </div>
        </div>
      );
    }

    // Archivo no compatible
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        {getFileIcon()}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{file.original_name}</h3>
          <p className="text-sm text-gray-600 mb-4">
            Previsualización no disponible para este tipo de archivo
          </p>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Descargar archivo
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl h-screen max-h-screen p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          Previsualización de {file.original_name}
        </DialogTitle>
        <div className="flex flex-col flex-1 h-full min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getFileIcon()}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 truncate">
                  {file.original_name}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Controles para imágenes */}
              {isImage && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center min-h-0">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-600">Cargando...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full h-full flex items-center justify-center min-h-0">
              {renderPreview()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 