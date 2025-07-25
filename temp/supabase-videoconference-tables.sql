-- 1. Crear tabla de reuniones
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id VARCHAR(255) UNIQUE NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER DEFAULT 60,
  max_participants INTEGER DEFAULT 50,
  require_approval BOOLEAN DEFAULT FALSE,
  enable_recording BOOLEAN DEFAULT FALSE,
  enable_chat BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
  is_recording BOOLEAN DEFAULT FALSE,
  recording_path TEXT,
  recording_start_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de participantes de reuniones
CREATE TABLE IF NOT EXISTS meeting_participants (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'moderator', 'participant')),
  UNIQUE(meeting_id, user_id)
);

-- 3. Crear tabla de salas activas
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) UNIQUE NOT NULL,
  meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de participantes activos en salas
CREATE TABLE IF NOT EXISTS room_participants (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  socket_id VARCHAR(255) NOT NULL,
  peer_id VARCHAR(255) NOT NULL,
  video_enabled BOOLEAN DEFAULT TRUE,
  audio_enabled BOOLEAN DEFAULT TRUE,
  screen_share_enabled BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 5. Crear tabla de mensajes del chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
  message_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_room_id ON meetings(room_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_rooms_meeting_id ON rooms(meeting_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(message_timestamp);

-- 7. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Crear triggers para actualizar updated_at
CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
  BEFORE UPDATE ON rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Habilitar Row Level Security (RLS)
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 10. Crear políticas de seguridad para meetings
CREATE POLICY "Users can view meetings they host or participate in" ON meetings
  FOR SELECT USING (
    host_id = auth.uid() OR 
    id IN (
      SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings" ON meetings
  FOR INSERT WITH CHECK (host_id = auth.uid());

CREATE POLICY "Hosts can update their meetings" ON meetings
  FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Hosts can delete their meetings" ON meetings
  FOR DELETE USING (host_id = auth.uid());

-- 11. Crear políticas de seguridad para meeting_participants
CREATE POLICY "Users can view participants of meetings they're in" ON meeting_participants
  FOR SELECT USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE host_id = auth.uid()
      UNION
      SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join meetings" ON meeting_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation" ON meeting_participants
  FOR UPDATE USING (user_id = auth.uid());

-- 12. Crear políticas de seguridad para rooms
CREATE POLICY "Users can view rooms of meetings they're in" ON rooms
  FOR SELECT USING (
    meeting_id IN (
      SELECT id FROM meetings WHERE host_id = auth.uid()
      UNION
      SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can create rooms" ON rooms
  FOR INSERT WITH CHECK (
    meeting_id IN (SELECT id FROM meetings WHERE host_id = auth.uid())
  );

-- 13. Crear políticas de seguridad para room_participants
CREATE POLICY "Users can view room participants" ON room_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON room_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own room participation" ON room_participants
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can leave rooms" ON room_participants
  FOR DELETE USING (user_id = auth.uid()::text);

-- 14. Crear políticas de seguridad para chat_messages
CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- 15. Crear función para obtener reuniones del usuario
CREATE OR REPLACE FUNCTION get_user_meetings()
RETURNS TABLE (
  id INTEGER,
  title VARCHAR(255),
  description TEXT,
  room_id VARCHAR(255),
  scheduled_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  status VARCHAR(20),
  host_name TEXT,
  host_email TEXT,
  participant_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.description,
    m.room_id,
    m.scheduled_time,
    m.duration,
    m.status,
    p.name as host_name,
    p.email as host_email,
    COUNT(mp.id) as participant_count,
    m.created_at
  FROM meetings m
  LEFT JOIN profiles p ON m.host_id = p.id
  LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
  WHERE m.host_id = auth.uid() OR m.id IN (
    SELECT meeting_id FROM meeting_participants WHERE user_id = auth.uid()
  )
  GROUP BY m.id, p.name, p.email
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Crear función para obtener participantes de una sala
CREATE OR REPLACE FUNCTION get_room_participants(room_id_param VARCHAR(255))
RETURNS TABLE (
  user_id VARCHAR(255),
  socket_id VARCHAR(255),
  peer_id VARCHAR(255),
  video_enabled BOOLEAN,
  audio_enabled BOOLEAN,
  screen_share_enabled BOOLEAN,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rp.user_id,
    rp.socket_id,
    rp.peer_id,
    rp.video_enabled,
    rp.audio_enabled,
    rp.screen_share_enabled,
    rp.joined_at
  FROM room_participants rp
  WHERE rp.room_id = room_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Crear función para obtener historial de chat
CREATE OR REPLACE FUNCTION get_chat_history(room_id_param VARCHAR(255))
RETURNS TABLE (
  user_id VARCHAR(255),
  username VARCHAR(255),
  message TEXT,
  message_type VARCHAR(20),
  message_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.user_id,
    cm.username,
    cm.message,
    cm.message_type,
    cm.message_timestamp
  FROM chat_messages cm
  WHERE cm.room_id = room_id_param
  ORDER BY cm.message_timestamp ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 