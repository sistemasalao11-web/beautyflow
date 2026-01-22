import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xzynbaudfzivapbaaxnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eW5iYXVkZnppdmFwYmFheG5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTg4NTQsImV4cCI6MjA4MjA3NDg1NH0.L2KFerOFaIjQnjyx5tCUbtzcAVPQrl4JMJLVpt9h12k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    const tables = [
        'salons', 'categories', 'services', 'professionals',
        'products', 'clients', 'appointments', 'sales', 'sale_items'
    ];

    console.log('--- Verificando Status RLS no PROD ---');

    for (const table of tables) {
        try {
            // Trying to select without auth should fail or return empty if RLS is on and no public policy allows it.
            // But more specifically, if we get "permission denied", RLS is definitely on.
            const { error } = await supabase.from(table).select('*').limit(1);

            if (error && error.code === '42501') {
                console.log(`✅ ${table}: RLS ATIVADO (Acesso negado para anon)`);
            } else if (error) {
                console.log(`⚠️ ${table}: Erro ao verificar - ${error.message} (${error.code})`);
            } else {
                // If it succeeds, it might still have RLS but with a public select policy.
                // In the schema, categories, services, professionals, appointments (insert) and salons_public_view have public access.
                console.log(`ℹ️ ${table}: Acesso permitido (Pode ter RLS com política pública ou sem RLS)`);
            }
        } catch (e) {
            console.log(`❌ Erro em ${table}:`, e.message);
        }
    }
}

checkRLS();
