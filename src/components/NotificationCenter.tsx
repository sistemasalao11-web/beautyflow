import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { X, MessageCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { openWhatsApp } from '../services/whatsapp';
import { useSaaS } from '../hooks/useSaaS';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
    onClose: () => void;
    pendingItems: any[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose, pendingItems }) => {
    const { actions } = useSaaS();

    const handleSend = (item: any) => {
        let message = '';
        const date = format(new Date(item.date), "dd/MM", { locale: ptBR });

        if (item.notificationType === 'confirmation') {
            message = `Fala, ${item.clientName}! ✂️\nConfirmando seu horário para ${item.serviceName} com ${item.professionalName} dia ${date} às ${item.time}.\n\nPosso confirmar?`;
        } else if (item.notificationType === 'remind_24h') {
            message = `Opa, ${item.clientName}! Passando pra lembrar do seu horário amanhã (${date}) às ${item.time}. 🔥\n\nAté lá!`;
        } else if (item.notificationType === 'remind_2h') {
            message = `Ei, ${item.clientName}! Daqui a pouco (às ${item.time}) te esperamos aqui na barbearia. 💈`;
        }

        openWhatsApp(item.clientPhone, message);
        actions.logNotification(item.id, item.notificationType);
    };

    return (
        <div className="absolute right-0 mt-4 w-96 z-[100] animate-slide-up">
            <Card className="bg-zinc-950 border-white/10 shadow-2xl overflow-hidden">
                <header className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter">Central de Avisos</h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Controle total do WhatsApp</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 text-zinc-500 transition-colors">
                        <X size={18} />
                    </button>
                </header>

                <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                    {pendingItems.length === 0 ? (
                        <div className="py-10 text-center space-y-3">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={24} className="text-zinc-700" />
                            </div>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Tudo em dia por aqui!</p>
                        </div>
                    ) : (
                        pendingItems.map((item) => (
                            <div
                                key={`${item.id}-${item.notificationType}`}
                                className="p-4 bg-zinc-900/60 border border-white/5 hover:border-yellow-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-sm ${item.notificationType === 'confirmation' ? 'bg-emerald-500/10 text-emerald-500' :
                                                item.notificationType === 'remind_24h' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {item.notificationType === 'confirmation' ? <CheckCircle2 size={12} /> :
                                                item.notificationType === 'remind_24h' ? <Calendar size={12} /> :
                                                    <Clock size={12} />}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {item.notificationType === 'confirmation' ? 'Confirmação' :
                                                item.notificationType === 'remind_24h' ? 'Lembrete 24h' : 'Lembrete 2h'}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-zinc-600 font-bold uppercase">{item.time}</span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight">{item.clientName}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold">{item.serviceName}</p>
                                </div>

                                <Button
                                    onClick={() => handleSend(item)}
                                    className="w-full !py-2.5 !bg-zinc-950 !text-zinc-400 hover:!bg-yellow-500 hover:!text-black border border-white/5 flex items-center justify-center gap-2 transition-all"
                                >
                                    <MessageCircle size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Enviar via Whats</span>
                                </Button>
                            </div>
                        ))
                    )}
                </div>

                <footer className="p-4 border-t border-white/5 bg-zinc-950/60 flex justify-center">
                    <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">BeautyFlow v2.0 • Manual Control</p>
                </footer>
            </Card>
        </div>
    );
};
