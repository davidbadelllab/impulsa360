import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  io?: any;
}

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

class MeetingController {
  // Crear nueva reunión
  async createMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, scheduledTime, duration, settings } = req.body;
      const roomId = uuidv4();
      
      // Crear la reunión
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title,
          description,
          host_id: req.user!.id,
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error creating meeting',
        error: error.message
      });
    }
  }

  // Obtener reunión por roomId
  async getMeetingByRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      
      const { data: meeting, error } = await supabase
        .from('meetings')
        .select(`
          *,
          host:profiles!meetings_host_id_fkey(name, email),
          participants:meeting_participants(
            user:profiles!meeting_participants_user_id_fkey(name, email),
            joined_at,
            left_at,
            role
          )
        `)
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching meeting',
        error: error.message
      });
    }
  }

  // Unirse a reunión
  async joinMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;

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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error joining meeting',
        error: error.message
      });
    }
  }

  // Finalizar reunión
  async endMeeting(req: AuthenticatedRequest, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = req.user!.id;

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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error ending meeting',
        error: error.message
      });
    }
  }

  // Obtener todas las reuniones del usuario
  async getUserMeetings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      // Usar la función personalizada para obtener reuniones del usuario
      const { data: meetings, error } = await supabase
        .rpc('get_user_meetings');

      if (error) throw error;

      res.json({
        success: true,
        meetings: meetings || []
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching meetings',
        error: error.message
      });
    }
  }

  // Actualizar configuración de reunión
  async updateMeetingSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const { roomId } = req.params;
      const { settings } = req.body;
      const userId = req.user!.id;

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
      const updateData: any = {};
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error updating meeting settings',
        error: error.message
      });
    }
  }
}

export default new MeetingController(); 