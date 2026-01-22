import type { Appointment, Product } from '../types/saas';

export const notificationHelper = {
    /**
     * Prepares a WhatsApp message for a new appointment
     */
    prepareAppointmentMessage: (appointment: Appointment, whatsapp: string) => {
        const message = `*Novo Agendamento!*\n\n` +
            `👤 Cliente: ${appointment.clientName}\n` +
            `✂️ Serviço: ${appointment.serviceName}\n` +
            `🧔 Barbeiro: ${appointment.professionalName}\n` +
            `📅 Data: ${appointment.date}\n` +
            `⏰ Horário: ${appointment.time}\n\n` +
            `_Confirmar agendamento?_`;

        return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    },

    /**
     * Prepares a low stock alert message for the owner
     */
    prepareLowStockAlert: (product: Product) => {
        return `⚠️ ALERTA DE ESTOQUE BAIXO: O produto "${product.name}" tem apenas ${product.stock} unidades restantes (Mínimo: ${product.minStock}).`;
    },

    /**
     * Prepares a daily report summary
     */
    prepareDailySummary: (metrics: { revenue: number, count: number }) => {
        return `📊 Resumo do Dia:\n\n` +
            `💰 Faturamento: R$ ${metrics.revenue.toFixed(2)}\n` +
            `📅 Agendamentos: ${metrics.count}\n` +
            `🚀 Continue assim!`;
    }
};
