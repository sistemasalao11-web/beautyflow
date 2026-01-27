/**
 * SERVIÇO DE MENSAGERIA WHATSAPP (MVP - CallMeBot)
 * 
 * Este serviço é uma ponte temporária. Para trocar por uma API oficial,
 * basta alterar a lógica dentro da função sendWhatsApp.
 */

/**
 * Formata o número para o padrão internacional (DDI + DDD + Numero)
 * Focado no Brasil (+55)
 */
export const formatWhatsAppPhone = (phone: string): string => {
    let clean = phone.replace(/\D/g, '');

    // Se estiver vazio, retorna vazio
    if (!clean) return '';

    // Se já tem o 55 no início e tem 12 ou 13 dígitos
    if (clean.length >= 12 && clean.startsWith('55')) {
        return clean;
    }

    // Se tem 10 ou 11 dígitos (DDD + Numero), adiciona o 55
    if (clean.length === 10 || clean.length === 11) {
        return `55${clean}`;
    }

    return clean;
};

export const sendWhatsApp = async (phone: string, message: string): Promise<boolean> => {
    const apiKey = import.meta.env.VITE_CALLMEBOT_API_KEY;

    if (!apiKey) {
        console.warn('[WHATSAPP] API Key não configurada. Mensagem não enviada.');
        return false;
    }

    try {
        const cleanPhone = formatWhatsAppPhone(phone);

        // Verifica se o número tem o tamanho mínimo (DDI 55 + DDD + Numero)
        if (cleanPhone.length < 12) {
            console.error('[WHATSAPP] Número de telefone inválido ou incompleto:', cleanPhone);
            return false;
        }

        // Endpoint CallMeBot
        const baseUrl = 'https://api.callmebot.com/whatsapp.php';
        const params = new URLSearchParams({
            phone: cleanPhone,
            text: message,
            apikey: apiKey
        });

        const url = `${baseUrl}?${params.toString()}`;

        /**
         * CALLMEBOT utiliza GET simples. 
         * Usamos mode 'no-cors' para evitar bloqueios de segurança do navegador no frontend,
         * já que é uma solução temporária de teste.
         */
        fetch(url, { mode: 'no-cors' })
            .then(() => console.log('[WHATSAPP] Requisição enviada com sucesso para:', cleanPhone))
            .catch(err => console.error('[WHATSAPP] Erro no disparo:', err));

        return true;
    } catch (error) {
        console.error('[WHATSAPP] Falha crítica no serviço:', error);
        return false;
    }
};
