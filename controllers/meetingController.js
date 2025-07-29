import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';
const supabase = createClient(supabaseUrl, supabaseKey);

class MeetingController {
  // Crear nueva reunión
  async createMeeting(req, res) {
    try {
      const { title, description, scheduledTime, duration, settings } = req.body;
      const roomId = uuidv4();
      
      // Crear la reunión
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title,
          description,
          host_id: req.user.id,
          room_id: roomId,
          scheduled_time: scheduledTime ? new Date(scheduledTime) : new Date(),
          duration: duration || 60,
          max_participants: settings?.maxParticipants || 50,
          require_approval: settings?.requireApproval || false,
          enable_recording: settings?.enableRecording || false,
          enable_chat: settings?.enableChat || true
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Crear sala asociada
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_id: roomId,
          meeting_id: meeting.id
        })
        .select()
        .single();

      if (roomError) throw roomError;

      res.status(201).json({
        success: true,
        meeting,
        joinUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/meeting/${roomId}`
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating meeting',
        error: error.message
      });
    }
  }

  // Obtener reunión por roomId
  async getMeetingByRoom(req, res) {
    try {
      const { roomId } = req.params;
      
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (error || !meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      res.json({
        success: true,
        meeting
      });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching meeting',
        error: error.message
      });
    }
  }

  // Unirse a reunión
  async joinMeeting(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      // Obtener la reunión
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (meetingError || !meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verificar si ya está en la reunión
      const { data: existingParticipant } = await supabase
        .from('meeting_participants')
        .select('*')
        .eq('meeting_id', meeting.id)
        .eq('user_id', userId)
        .single();

      if (!existingParticipant) {
        // Agregar participante
        const { error: participantError } = await supabase
          .from('meeting_participants')
          .insert({
            meeting_id: meeting.id,
            user_id: userId,
            role: meeting.host_id === userId ? 'host' : 'participant'
          });

        if (participantError) throw participantError;
      }

      res.json({
        success: true,
        message: 'Joined meeting successfully',
        meeting
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Error joining meeting',
        error: error.message
      });
    }
  }

  // Finalizar reunión
  async endMeeting(req, res) {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;

      // Obtener la reunión
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (meetingError || !meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verificar que es el host
      if (meeting.host_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only host can end meeting'
        });
      }

      // Actualizar estado de la reunión
      const { error: updateError } = await supabase
        .from('meetings')
        .update({ status: 'ended' })
        .eq('id', meeting.id);

      if (updateError) throw updateError;

      // Notificar a todos los participantes via socket
      if (req.io) {
        req.io.to(roomId).emit('meeting-ended', {
          message: 'Meeting has been ended by host'
        });
      }

      res.json({
        success: true,
        message: 'Meeting ended successfully'
      });
    } catch (error) {
      console.error('Error ending meeting:', error);
      res.status(500).json({
        success: false,
        message: 'Error ending meeting',
        error: error.message
      });
    }
  }

  // Obtener todas las reuniones del usuario
  async getUserMeetings(req, res) {
    try {
      const userId = req.user.id;
      
      console.log('🔍 Getting meetings for user:', userId);
      
      // Primero intentar obtener reuniones donde el usuario es el host
      const { data: hostedMeetings, error: hostedError } = await supabase
        .from('meetings')
        .select('*')
        .eq('host_id', userId)
        .order('created_at', { ascending: false });

      if (hostedError) {
        console.error('Error getting hosted meetings:', hostedError);
      }

      // También obtener reuniones donde el usuario es participante
      const { data: participantMeetings, error: participantError } = await supabase
        .from('meeting_participants')
        .select(`
          meeting:meetings(*)
        `)
        .eq('user_id', userId);

      if (participantError) {
        console.error('Error getting participant meetings:', participantError);
      }

      // Combinar y deduplicar reuniones
      const allMeetings = [
        ...(hostedMeetings || []),
        ...(participantMeetings?.map(p => p.meeting) || [])
      ];

      // Remover duplicados por ID
      const uniqueMeetings = allMeetings.filter((meeting, index, self) => 
        index === self.findIndex(m => m.id === meeting.id)
      );

      console.log('✅ Found meetings:', uniqueMeetings.length);

      res.json({
        success: true,
        meetings: uniqueMeetings
      });
    } catch (error) {
      console.error('💥 Error fetching meetings:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching meetings',
        error: error.message
      });
    }
  }

  // Actualizar configuración de reunión
  async updateMeetingSettings(req, res) {
    try {
      const { roomId } = req.params;
      const { settings } = req.body;
      const userId = req.user.id;

      // Obtener la reunión
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (meetingError || !meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }

      // Verificar que es el host
      if (meeting.host_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only host can update meeting settings'
        });
      }

      // Actualizar configuraciones
      const updateData = {};
      if (settings?.maxParticipants) updateData.max_participants = settings.maxParticipants;
      if (settings?.requireApproval !== undefined) updateData.require_approval = settings.requireApproval;
      if (settings?.enableRecording !== undefined) updateData.enable_recording = settings.enableRecording;
      if (settings?.enableChat !== undefined) updateData.enable_chat = settings.enableChat;

      const { data: updatedMeeting, error: updateError } = await supabase
        .from('meetings')
        .update(updateData)
        .eq('id', meeting.id)
        .select()
        .single();

      if (updateError) throw updateError;

      res.json({
        success: true,
        message: 'Meeting settings updated successfully',
        meeting: updatedMeeting
      });
    } catch (error) {
      console.error('Error updating meeting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating meeting settings',
        error: error.message
      });
    }
  }
}

export default new MeetingController();
