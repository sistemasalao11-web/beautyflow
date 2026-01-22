import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzynbaudfzivapbaaxnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eW5iYXVkZnppdmFwYmFheG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTg4NTQsImV4cCI6MjA4MjA3NDg1NH0.L2KFerOFaIjQnjyx5tCUbtzcAVPQrl4JMJLVpt9h12k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkView() {
    console.log('--- Verificando View Pública ---');
    const { data, error } = await supabase.from('salons_public_view').select('*').limit(1);
    if (error) {
        console.log(`❌ Erro na view: ${error.message} (Código: ${error.code})`);
    } else {
        console.log(`✅ View "salons_public_view" está acessível.`);
    }
}

checkView();
