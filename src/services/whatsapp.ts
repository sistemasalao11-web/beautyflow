/**
 * SERVIÇO DE MENSAGERIA WHATSAPP (MVP - CallMeBot)
 * 
 * Este serviço é uma ponte temporária. Para trocar por uma API oficial,
 * basta alterar a lógica dentro da função sendWhatsApp.
 */

export const sendWhatsApp = async (phone: string, message: string): Promise<boolean> => {
    const apiKey = import.meta.env.VITE_CALLMEBOT_API_KEY;

    if (!apiKey) {
        console.warn('[WHATSAPP] API Key não configurada. Mensagem não enviada.');
        return false;
    }

    try {
        // Limpa o telefone: remove tudo que não for número
        const cleanPhone = phone.replace(/\D/g, '');

        // Verifica se o número tem o tamanho mínimo (DDI + DDD + Numero)
        if (cleanPhone.length < 11) {
            console.error('[WHATSAPP] Número de telefone inválido:', cleanPhone);
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
