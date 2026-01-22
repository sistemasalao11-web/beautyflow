export interface Settings {
    salonName: string;
    whatsapp: string; // apenas numeros
    messageTemplate: string; // "Olá, gostaria de agendar {{service}}"
}

export const DEFAULT_SETTINGS: Settings = {
    salonName: 'Meu Salão Premium',
    whatsapp: '5511930102015',
    messageTemplate: 'Olá, gostaria de agendar o serviço {{service}} (Valor: R$ {{price}}). Como estão os horários?',
};
