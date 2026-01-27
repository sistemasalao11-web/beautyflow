import { supabase } from '../lib/supabase';
import { sendWhatsApp } from './whatsapp';
import { addHours, addDays, isWithinInterval, parseISO } from 'date-fns';

export const processAutomations = async (salonId: string) => {
    console.log('[AUTOMATION] Iniciando varredura de lembretes...');

    try {
        // 1. Buscar agendamentos pendentes/confirmados para as próximas 24h
        const { data: appts, error } = await supabase
            .from('appointments')
            .select('*, salons(name), clients(name, phone), services(name), professionals(name)')
            .eq('salon_id', salonId)
            .in('status', ['pending', 'confirmed']);

        if (error || !appts) return;

        const now = new Date();
        const t24h_limit = addDays(now, 1);
        const t2h_limit = addHours(now, 2);

        for (const appt of appts) {
            try {
                const apptDateTime = parseISO(`${appt.date}T${appt.time}`);
                const salonName = appt.salons?.name || 'sua barbearia';
                const clientName = appt.clients?.name || appt.client_name || 'Cliente';
                const clientPhone = appt.clients?.phone || appt.client_phone || '';
                const serviceName = appt.services?.name || appt.service_name || 'serviço';

                if (!clientPhone) continue; // Sem telefone, sem lembrete

                // --- LÓGICA T-24H ---
                const isT24h = isWithinInterval(apptDateTime, {
                    start: addHours(t24h_limit, -1), // Janela de 1h de precisão
                    end: t24h_limit
                });

                if (isT24h) {
                    await triggerReminder(appt, 'remind_24h',
                        `Ei, ${clientName}!\nSó pra lembrar do seu horário amanhã às ${appt.time} na ${salonName}. 🔥\n\nSe precisar remarcar, avise aqui!`,
                        clientPhone
                    );
                }

                // --- LÓGICA T-2H ---
                const isT2h = isWithinInterval(apptDateTime, {
                    start: now,
                    end: t2h_limit
                });

                if (isT2h) {
                    await triggerReminder(appt, 'remind_2h',
                        `Tá chegando!\nEm 2 horas te esperamos na ${salonName} para seu ${serviceName}. ✂️`,
                        clientPhone
                    );
                }
            } catch (err) {
                console.warn('[AUTOMATION] Erro ao processar agendamento individual:', appt.id, err);
            }
        }
    } catch (err) {
        console.error('[AUTOMATION] Erro na varredura:', err);
    }
};

async function triggerReminder(appt: any, type: string, message: string, phone: string) {
    // 1. Verificar se já foi enviado hoje
    const { data: existing } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('appointment_id', appt.id)
        .eq('type', type)
        .limit(1);

    if (existing && existing.length > 0) return; // Já enviado!

    // 2. Tentar enviar WhatsApp
    const success = await sendWhatsApp(phone, message);

    if (success) {
        // 3. Registrar no log para não repetir
        await supabase.from('notification_logs').insert({
            appointment_id: appt.id,
            salon_id: appt.salon_id,
            type: type,
            status: 'sent'
        });
        console.log(`[AUTOMATION] Lembrete ${type} enviado para ${appt.clients?.name || appt.client_name}`);
    }
}
