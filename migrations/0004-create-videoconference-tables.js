import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/impulsa360'
});

async function createVideoconferenceTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Crear tabla de reuniones
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        room_id VARCHAR(255) UNIQUE NOT NULL,
        scheduled_time TIMESTAMP,
        duration INTEGER DEFAULT 60,
        max_participants INTEGER DEFAULT 50,
        require_approval BOOLEAN DEFAULT FALSE,
        enable_recording BOOLEAN DEFAULT FALSE,
        enable_chat BOOLEAN DEFAULT TRUE,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended')),
        is_recording BOOLEAN DEFAULT FALSE,
        recording_path TEXT,
        recording_start_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de participantes
    await client.query(`
      CREATE TABLE IF NOT EXISTS meeting_participants (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP,
        role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('host', 'moderator', 'participant')),
        UNIQUE(meeting_id, user_id)
      )
    `);

    // Crear tabla de salas activas
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255) UNIQUE NOT NULL,
        meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de participantes activos en salas
    await client.query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        socket_id VARCHAR(255) NOT NULL,
        peer_id VARCHAR(255) NOT NULL,
        video_enabled BOOLEAN DEFAULT TRUE,
        audio_enabled BOOLEAN DEFAULT TRUE,
        screen_share_enabled BOOLEAN DEFAULT FALSE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      )
    `);

    // Crear tabla de mensajes del chat
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para mejorar el rendimiento
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_room_id ON meetings(room_id);
      CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
      CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
      CREATE INDEX IF NOT EXISTS idx_rooms_meeting_id ON rooms(meeting_id);
      CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
    `);

    // Crear función para actualizar updated_at automáticamente
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Crear triggers para actualizar updated_at
    await client.query(`
      CREATE TRIGGER update_meetings_updated_at 
        BEFORE UPDATE ON meetings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_rooms_updated_at 
        BEFORE UPDATE ON rooms 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query('COMMIT');
    console.log('✅ Tablas de videoconferencias creadas exitosamente');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creando tablas de videoconferencias:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar la migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createVideoconferenceTables()
    .then(() => {
      console.log('Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error en migración:', error);
      process.exit(1);
    });
}

export { createVideoconferenceTables }; 