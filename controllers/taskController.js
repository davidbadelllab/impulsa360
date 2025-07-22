import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Usar exactamente la misma configuración que funciona en test-move-card.mjs
const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';

console.log('🔧 TaskController - Configuración Supabase (hardcoded):');
console.log('URL:', supabaseUrl);
console.log('Key configurada:', supabaseKey ? 'Sí' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// ===== BOARDS =====
export const getBoards = async (req, res) => {
  try {
    const { company_id } = req.query;
    let query = supabase
      .from('boards')
      .select(`
        *,
        created_by_user:users!boards_created_by_fkey(username, email),
        lists:lists(
          *,
          cards:cards(
            *,
            labels:card_labels(label:labels(*)),
            assignments:card_assignments(user:users(*)),
            comments:comments(*),
            checklists:checklists(
              *,
              items:checklist_items(*)
            ),
            attachments:attachments(*)
          )
        ),
        labels:labels(*)
      `)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (company_id) {
      query = query.eq('company_id', company_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error obteniendo tableros:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createBoard = async (req, res) => {
  try {
    const { name, description, company_id } = req.body;
    const created_by = req.user.id;

    const { data, error } = await supabase
      .from('boards')
      .insert([{ name, description, company_id, created_by }])
      .select()
      .single();

    if (error) throw error;

    // Crear listas por defecto
    const defaultLists = [
      { name: 'Pendiente', position: 0, board_id: data.id },
      { name: 'En Progreso', position: 1, board_id: data.id },
      { name: 'Revisión', position: 2, board_id: data.id },
      { name: 'Terminado', position: 3, board_id: data.id }
    ];

    await supabase.from('lists').insert(defaultLists);

    // Crear etiquetas predeterminadas
    const defaultLabels = [
      { name: 'Urgente', color: '#ff4757', board_id: data.id },
      { name: 'Importante', color: '#ffa726', board_id: data.id },
      { name: 'Normal', color: '#42a5f5', board_id: data.id },
      { name: 'Baja Prioridad', color: '#66bb6a', board_id: data.id }
    ];

    await supabase.from('labels').insert(defaultLabels);

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando tablero:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_archived } = req.body;

    const { data, error } = await supabase
      .from('boards')
      .update({ name, description, is_archived })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error actualizando tablero:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Tablero eliminado' });
  } catch (error) {
    console.error('Error eliminando tablero:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== LISTS =====
export const createList = async (req, res) => {
  try {
    const { name, board_id, position } = req.body;

    const { data, error } = await supabase
      .from('lists')
      .insert([{ name, board_id, position }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando lista:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, is_archived } = req.body;

    const { data, error } = await supabase
      .from('lists')
      .update({ name, position, is_archived })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error actualizando lista:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Lista eliminada' });
  } catch (error) {
    console.error('Error eliminando lista:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== CARDS =====
export const createCard = async (req, res) => {
  try {
    const { title, description, list_id, position, due_date } = req.body;
    const created_by = req.user.id;

    const { data, error } = await supabase
      .from('cards')
      .insert([{ title, description, list_id, position, due_date, created_by }])
      .select(`
        *,
        labels:card_labels(label:labels(*)),
        assignments:card_assignments(user:users(*)),
        comments:comments(*),
        checklists:checklists(
          *,
          items:checklist_items(*)
        ),
        attachments:attachments(*)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando tarjeta:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, list_id, position, due_date, is_archived } = req.body;

    const { data, error } = await supabase
      .from('cards')
      .update({ title, description, list_id, position, due_date, is_archived })
      .eq('id', id)
      .select(`
        *,
        labels:card_labels(label:labels(*)),
        assignments:card_assignments(user:users(*)),
        comments:comments(*),
        checklists:checklists(
          *,
          items:checklist_items(*)
        ),
        attachments:attachments(*)
      `)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error actualizando tarjeta:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Tarjeta eliminada' });
  } catch (error) {
    console.error('Error eliminando tarjeta:', error);
    res.status(500).json({ error: error.message });
  }
};

export const moveCard = async (req, res) => {
  try {
    console.log('=== MOVE CARD REQUEST ===');
    console.log('Request body:', req.body);
    const { cardId, newListId, newPosition } = req.body;

    // Validar que los parámetros existan
    if (!cardId || !newListId || newPosition === undefined) {
      console.log('❌ Missing parameters:', { cardId, newListId, newPosition });
      return res.status(400).json({ 
        error: 'Missing required parameters: cardId, newListId, newPosition' 
      });
    }

    console.log('📋 Moving card:', { cardId, newListId, newPosition });

    // PASO 1: Verificar que la tarjeta existe y obtener su board
    const { data: existingCard, error: cardError } = await supabase
      .from('cards')
      .select(`
        id, 
        title, 
        list_id,
        lists!inner(board_id)
      `)
      .eq('id', cardId)
      .single();

    if (cardError) {
      console.error('Error verificando tarjeta:', cardError);
      return res.status(404).json({ 
        error: `Tarjeta con ID ${cardId} no encontrada` 
      });
    }

    const cardBoardId = existingCard.lists.board_id;
    console.log('Tarjeta encontrada:', existingCard);
    console.log('Board de la tarjeta:', cardBoardId);

    // PASO 2: Verificar que la lista destino existe y pertenece al mismo board
    const { data: existingList, error: listError } = await supabase
      .from('lists')
      .select('id, name, board_id')
      .eq('id', newListId)
      .eq('board_id', cardBoardId)
      .single();

    if (listError) {
      console.error('Error verificando lista:', listError);
      return res.status(404).json({ 
        error: `Lista con ID ${newListId} no encontrada en el board ${cardBoardId}` 
      });
    }

    console.log('Lista destino encontrada:', existingList);

    // PASO 3: Actualizar la tarjeta
    const { data, error } = await supabase
      .from('cards')
      .update({ 
        list_id: newListId, 
        position: newPosition 
      })
      .eq('id', cardId)
      .select('*')
      .single();

    if (error) {
      console.error('Error actualizando tarjeta:', error);
      if (error.code === 'PGRST116') {
        return res.status(500).json({ 
          error: 'No se pudo actualizar la tarjeta. Verifica que la tarjeta y lista existan.' 
        });
      }
      throw error;
    }

    console.log('Tarjeta movida exitosamente:', data);
    res.json({
      success: true,
      message: `Tarjeta "${data.title}" movida a "${existingList.name}"`,
      data: data
    });
  } catch (error) {
    console.error('Error moviendo tarjeta:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== LABELS =====
export const createLabel = async (req, res) => {
  try {
    const { name, color, board_id } = req.body;

    const { data, error } = await supabase
      .from('labels')
      .insert([{ name, color, board_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando etiqueta:', error);
    res.status(500).json({ error: error.message });
  }
};

export const assignLabelToCard = async (req, res) => {
  try {
    const { card_id, label_id } = req.body;

    const { data, error } = await supabase
      .from('card_labels')
      .insert([{ card_id, label_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error asignando etiqueta:', error);
    res.status(500).json({ error: error.message });
  }
};

export const removeLabelFromCard = async (req, res) => {
  try {
    const { card_id, label_id } = req.params;
    const { error } = await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', card_id)
      .eq('label_id', label_id);

    if (error) throw error;
    res.json({ message: 'Etiqueta removida' });
  } catch (error) {
    console.error('Error removiendo etiqueta:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ASSIGNMENTS =====
export const assignUserToCard = async (req, res) => {
  try {
    const { card_id, user_id } = req.body;

    const { data, error } = await supabase
      .from('card_assignments')
      .insert([{ card_id, user_id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error asignando usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

export const removeUserFromCard = async (req, res) => {
  try {
    const { card_id, user_id } = req.params;
    const { error } = await supabase
      .from('card_assignments')
      .delete()
      .eq('card_id', card_id)
      .eq('user_id', user_id);

    if (error) throw error;
    res.json({ message: 'Usuario removido' });
  } catch (error) {
    console.error('Error removiendo usuario:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== COMMENTS =====
export const createComment = async (req, res) => {
  try {
    const { content, card_id } = req.body;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ content, card_id, user_id }])
      .select(`
        *,
        user:users(username, email)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== CHECKLISTS =====
export const createChecklist = async (req, res) => {
  try {
    const { title, card_id, position } = req.body;

    const { data, error } = await supabase
      .from('checklists')
      .insert([{ title, card_id, position }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando checklist:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createChecklistItem = async (req, res) => {
  try {
    const { title, checklist_id, position } = req.body;

    const { data, error } = await supabase
      .from('checklist_items')
      .insert([{ title, checklist_id, position }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando item de checklist:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_completed, position } = req.body;

    const { data, error } = await supabase
      .from('checklist_items')
      .update({ title, is_completed, position })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error actualizando item de checklist:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== ATTACHMENTS =====
export const createAttachment = async (req, res) => {
  try {
    const { filename, original_name, mime_type, size, url, card_id } = req.body;
    const uploaded_by = req.user.id;

    const { data, error } = await supabase
      .from('attachments')
      .insert([{ filename, original_name, mime_type, size, url, card_id, uploaded_by }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creando adjunto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Adjunto eliminado' });
  } catch (error) {
    console.error('Error eliminando adjunto:', error);
    res.status(500).json({ error: error.message });
  }
}; 

// ===== USERS =====
export const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email')
      .order('username');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// ===== TEST ENDPOINT =====
export const testSupabase = async (req, res) => {
  try {
    console.log('🧪 Testing Supabase configuration...');
    
    // Probar una consulta simple
    const { data, error } = await supabase
      .from('cards')
      .select('id, title')
      .limit(1);

    if (error) {
      console.error('❌ Supabase test error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Supabase test successful:', data);
    res.json({ 
      message: 'Supabase configuration is working',
      data: data,
      config: {
        url: supabaseUrl,
        keyConfigured: !!supabaseKey
      }
    });
  } catch (error) {
    console.error('💥 Test error:', error);
    res.status(500).json({ error: error.message });
  }
}; 