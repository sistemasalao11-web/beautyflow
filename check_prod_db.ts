import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzynbaudfzivapbaaxnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eW5iYXVkZnppdmFwYmFheG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTg4NTQsImV4cCI6MjA4MjA3NDg1NH0.L2KFerOFaIjQnjyx5tCUbtzcAVPQrl4JMJLVpt9h12k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    const tablesToCheck = ['salons', 'services', 'appointments', 'clients', 'professionals'];
    console.log('--- Verificando Tabelas ---');

    for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('*').limit(1);
        // 404 means table not found, or RLS might block but usually 404 is the indicator of missing table in PostgREST
        // PostgREST returns 404 if table doesn't exist
        if (error) {
            if (error.code === '42P01') {
                console.log(`❌ Tabela "${table}" NÃO encontrada.`);
            } else {
                console.log(`⚠️ Tabela "${table}" retornou erro: ${error.message} (Código: ${error.code})`);
            }
        } else {
            console.log(`✅ Tabela "${table}" existe.`);
        }
    }
}

checkDatabase();
