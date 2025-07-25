import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 MediaController - Configuración Supabase:');
console.log('URL:', supabaseUrl);
console.log('Key configurada:', supabaseKey ? 'Sí' : 'No');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB límite
  fileFilter: (req, file, cb) => {
    // Permitir todos los tipos de archivo
    cb(null, true);
  }
});

// Obtener carpetas y archivos de un usuario
const getMediaItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId } = req.query;
    
    // Obtener carpetas
    let foldersQuery = supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId);
    
    if (folderId) {
      foldersQuery = foldersQuery.eq('parent_id', folderId);
    } else {
      foldersQuery = foldersQuery.is('parent_id', null);
    }
    
    const { data: folders, error: foldersError } = await foldersQuery;
    
    if (foldersError) {
      return res.status(500).json({ error: 'Error obteniendo carpetas' });
    }
    
    // Obtener archivos
    let filesQuery = supabase
      .from('files')
      .select('*')
      .eq('user_id', userId);
    
    if (folderId) {
      filesQuery = filesQuery.eq('folder_id', folderId);
    } else {
      filesQuery = filesQuery.is('folder_id', null);
    }
    
    const { data: files, error: filesError } = await filesQuery;
    
    if (filesError) {
      return res.status(500).json({ error: 'Error obteniendo archivos' });
    }
    
    // Obtener carpetas compartidas conmigo
    const { data: sharedFolders } = await supabase
      .from('folder_shares')
      .select(`
        *,
        folder:folders(*)
      `)
      .eq('shared_with', userId);
    
    // Obtener archivos compartidos conmigo
    const { data: sharedFiles } = await supabase
      .from('file_shares')
      .select(`
        *,
        file:files(*)
      `)
      .eq('shared_with', userId);
    
    res.json({
      folders: folders || [],
      files: files || [],
      sharedFolders: sharedFolders || [],
      sharedFiles: sharedFiles || []
    });
    
  } catch (error) {
    console.error('Error en getMediaItems:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear carpeta
const createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;
    const { name, parentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la carpeta es requerido' });
    }
    
    const { data, error } = await supabase
      .from('folders')
      .insert({
        name,
        parent_id: parentId || null,
        user_id: userId,
        company_id: companyId
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Error creando carpeta' });
    }
    
    res.status(201).json(data);
    
  } catch (error) {
    console.error('Error en createFolder:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Subir archivo
const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;
    const { folderId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }
    
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: req.file.filename,
        original_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        folder_id: folderId || null,
        user_id: userId,
        company_id: companyId
      })
      .select()
      .single();
    
    if (error) {
      // Eliminar archivo físico si falla la inserción en BD
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Error guardando archivo' });
    }
    
    res.status(201).json(data);
    
  } catch (error) {
    console.error('Error en uploadFile:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar carpeta
const deleteFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verificar que la carpeta pertenece al usuario
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (folderError || !folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    
    // Eliminar carpeta (cascade eliminará archivos y subcarpetas)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: 'Error eliminando carpeta' });
    }
    
    res.json({ message: 'Carpeta eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error en deleteFolder:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar archivo
const deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verificar que el archivo pertenece al usuario
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fileError || !file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Eliminar archivo de la base de datos
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(500).json({ error: 'Error eliminando archivo' });
    }
    
    // Eliminar archivo físico
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }
    
    res.json({ message: 'Archivo eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error en deleteFile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Compartir archivo
const shareFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fileId, sharedWithUserId, permissionType } = req.body;
    
    if (!fileId || !sharedWithUserId || !permissionType) {
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }
    
    // Verificar que el archivo pertenece al usuario
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();
    
    if (fileError || !file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Crear compartir
    const { data, error } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        shared_by: userId,
        shared_with: sharedWithUserId,
        permission_type: permissionType
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Error compartiendo archivo' });
    }
    
    res.status(201).json(data);
    
  } catch (error) {
    console.error('Error en shareFile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Compartir carpeta
const shareFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, sharedWithUserId, permissionType } = req.body;
    
    if (!folderId || !sharedWithUserId || !permissionType) {
      return res.status(400).json({ error: 'Datos requeridos faltantes' });
    }
    
    // Verificar que la carpeta pertenece al usuario
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();
    
    if (folderError || !folder) {
      return res.status(404).json({ error: 'Carpeta no encontrada' });
    }
    
    // Crear compartir
    const { data, error } = await supabase
      .from('folder_shares')
      .insert({
        folder_id: folderId,
        shared_by: userId,
        shared_with: sharedWithUserId,
        permission_type: permissionType
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'Error compartiendo carpeta' });
    }
    
    res.status(201).json(data);
    
  } catch (error) {
    console.error('Error en shareFolder:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Descargar archivo
const downloadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar que el usuario tiene acceso al archivo
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();

    if (fileError || !file) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar permisos (propietario o compartido)
    const isOwner = file.user_id === userId;
    let hasAccess = isOwner;

    if (!isOwner) {
      const { data: share } = await supabase
        .from('file_shares')
        .select('*')
        .eq('file_id', id)
        .eq('shared_with', userId)
        .single();
      hasAccess = !!share;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'No tienes permisos para acceder a este archivo' });
    }

    // Verificar que el archivo existe físicamente
    const absolutePath = path.isAbsolute(file.file_path)
      ? file.file_path
      : path.resolve(__dirname, '../', file.file_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
    }

    // Determinar si es descarga o visualización
    const isDownload = req.query.download === 'true';
    const mimeType = file.mime_type || 'application/octet-stream';
    const ext = path.extname(file.original_name).toLowerCase();

    // Logs para depuración
    console.log('[downloadFile] id:', id, 'mime:', mimeType, 'path:', absolutePath, 'download:', isDownload);

    // Tipos que se pueden previsualizar
    const isImage = mimeType.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';
    const isOffice = [
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.odt', '.ods', '.odp'
    ].includes(ext);

    if (isDownload || isOffice) {
      // Forzar descarga para archivos de Office o si se solicita explícitamente
      res.download(absolutePath, file.original_name);
    } else if (isImage || isPDF) {
      // Previsualización de imágenes y PDFs
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
      res.sendFile(absolutePath, (err) => {
        if (err) {
          console.error('[downloadFile] Error enviando archivo:', err);
          res.status(500).json({ error: 'Error enviando archivo' });
        }
      });
    } else {
      // Otros archivos: forzar descarga
      res.download(absolutePath, file.original_name);
    }
  } catch (error) {
    console.error('Error en downloadFile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener usuarios para compartir
const getUsersForSharing = async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.user.company_id;
    
    console.log('getUsersForSharing - userId:', userId, 'companyId:', companyId);
    
    let query = supabase
      .from('users')
      .select('id, username, email, company_id')
      .neq('id', userId);
    
    // Si el usuario tiene company_id, filtrar por la misma empresa
    // Si no, mostrar todos los usuarios (excepto el actual)
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    const { data: users, error } = await query;
    
    if (error) {
      console.error('Error en query users:', error);
      return res.status(500).json({ error: 'Error obteniendo usuarios' });
    }
    
    console.log('Usuarios encontrados:', users?.length || 0);
    res.json(users || []);
    
  } catch (error) {
    console.error('Error en getUsersForSharing:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export {
  getMediaItems,
  createFolder,
  uploadFile,
  deleteFolder,
  deleteFile,
  shareFile,
  shareFolder,
  downloadFile,
  getUsersForSharing
};

// Exportar el middleware de upload por separado
export const uploadMiddleware = upload.single('file'); 