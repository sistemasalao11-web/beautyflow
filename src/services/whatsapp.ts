/**
 * SERVIÇO DE WHATSAPP (CONTROLE MANUAL)
 * 
 * Gera links de 'wa.me' para que o barbeiro dispare as mensagens
 * diretamente de seu próprio número.
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

/**
 * Gera a URL do WhatsApp Web/App para disparo manual
 */
export const getWhatsAppUrl = (phone: string, message: string): string => {
    const cleanPhone = formatWhatsAppPhone(phone);
    if (!cleanPhone) return '';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

/**
 * Abre o WhatsApp em uma nova aba
 */
export const openWhatsApp = (phone: string, message: string): void => {
    const url = getWhatsAppUrl(phone, message);
    if (url) {
        window.open(url, '_blank');
    }
};
