import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztyijfstkfzltyhhrnyt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0eWlqZnN0a2Z6bHR5aGhybnl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzA3MzQ0NSwiZXhwIjoyMDU4NjQ5NDQ1fQ.49e2MEhWZla1n9vFSfGk3E6UTKXh3lOltiNMdOpld9A';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBriefingTable() {
    try {
        console.log('🔍 Checking briefing table...');
        
        // Intentar obtener la estructura de la tabla
        const { data, error } = await supabase
            .from('briefing')
            .select('*')
            .limit(1);
            
        if (error) {
            console.error('❌ Error accessing briefing table:', error);
            
            // Si la tabla no existe, crear la estructura
            if (error.code === '42P01') { // Table does not exist
                console.log('📝 Creating briefing table...');
                await createBriefingTable();
            }
        } else {
            console.log('✅ Briefing table exists and is accessible');
            console.log('📊 Sample data:', data);
        }
        
    } catch (error) {
        console.error('💥 Error checking briefing table:', error);
    }
}

async function createBriefingTable() {
    try {
        // Crear la tabla briefing usando SQL
        const { error } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS briefing (
                    id SERIAL PRIMARY KEY,
                    type VARCHAR(100) NOT NULL,
                    category VARCHAR(100),
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    company_id INTEGER REFERENCES companies(id),
                    priority VARCHAR(50) DEFAULT 'medium',
                    due_date TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'pending',
                    is_read BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `
        });
        
        if (error) {
            console.error('❌ Error creating briefing table:', error);
        } else {
            console.log('✅ Briefing table created successfully');
        }
        
    } catch (error) {
        console.error('💥 Error in createBriefingTable:', error);
    }
}

checkBriefingTable(); 