import React, { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isOpen: boolean;
  onToggle: () => void;
}



export default function FileUpload({ onFileSelect, isOpen, onToggle }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      onToggle();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 min-w-48">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Adjuntar archivo</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleClick}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
        >
          <Paperclip className="mx-auto mb-2 text-gray-400" size={20} />
          <p className="text-sm text-gray-600">Seleccionar archivo</p>
          <p className="text-xs text-gray-400 mt-1">Máximo 10MB</p>
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Tipos soportados:</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-gray-100 rounded">Imágenes</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Documentos</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Videos</span>
            <span className="px-2 py-1 bg-gray-100 rounded">Audio</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        max="10485760" // 10MB
      />
    </div>
  );
} 