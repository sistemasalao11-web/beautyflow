import { useState, useMemo } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
    Scissors,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import { format, isAfter, parse, isToday } from 'date-fns';



export const ClientBooking = () => {
    const { services, professionals, settings, appointments, loading, actions } = useSaaS();
    const [step, setStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
    const [honeypot, setHoneypot] = useState(''); // Bot trap

    const [selection, setSelection] = useState({
        serviceId: '',
        professionalId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: ''
    });

    const selectedService = services.find(s => s.id === selection.serviceId);
    const selectedProf = professionals.find(p => p.id === selection.professionalId);

    // Smart Availability Logic
    const availableSlots = useMemo(() => {
        if (!selection.date || !settings?.operatingHours || !selectedService) return [];

        const date = parse(selection.date, 'yyyy-MM-dd', new Date());
        const dayOfWeek = date.getDay();
        const dayHours = settings.operatingHours.find((h: any) => h.day === dayOfWeek);

        if (!dayHours || !dayHours.active) return [];

        const slots: string[] = [];
        let current = parse(dayHours.open, 'HH:mm', new Date());
        const end = parse(dayHours.close, 'HH:mm', new Date());

        // Dynamic interval based on service duration (min 30min)
        const intervalMinutes = Math.max(30, selectedService.duration || 60);

        while (current < end) {
            slots.push(format(current, 'HH:mm'));
            current = new Date(current.getTime() + intervalMinutes * 60 * 1000);
        }

        const now = new Date();

        return slots.map(time => {
            const slotDate = parse(`${selection.date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());

            // 1. Is it in the past?
            const isPast = isToday(parse(selection.date, 'yyyy-MM-dd', new Date())) && !isAfter(slotDate, now);

            // 2. Is it already booked?
            const isBooked = appointments.some(appt =>
                appt.date === selection.date &&
                appt.time.substring(0, 5) === time &&
                appt.status !== 'cancelled'
            );

            return { time, isPast, isBooked };
        });
    }, [selection.date, appointments, settings, selectedService]);

    const handleBooking = async () => {
        if (!selectedService || !selectedProf || !clientInfo.name || !clientInfo.phone) return;

        try {
            await actions.addAppointment({
                clientName: clientInfo.name,
                clientPhone: clientInfo.phone,
                serviceId: selectedService.id,
                professionalId: selectedProf.id,
                serviceName: selectedService.name,
                professionalName: selectedProf.name,
                date: selection.date,
                time: selection.time,
                status: 'pending',
                totalPrice: selectedService.price,
                metadata: { honeypot } // Security data
            });


            const whatsappMessage = `Olá! Gostaria de confirmar meu agendamento:
📌 *Serviço:* ${selectedService.name}
👤 *Profissional:* ${selectedProf.name}
📅 *Data:* ${selection.date}
⏰ *Horário:* ${selection.time}
💰 *Valor:* R$ ${selectedService.price.toFixed(2)}`;

            const whatsappUrl = `https://wa.me/${(settings?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
            setIsSuccess(true);


            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 2000);

        } catch (err) {
            console.error('Reservation failed:', err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="h-10 w-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
    );

    if (!settings) return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Salão não encontrado</h2>
            <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold max-w-xs leading-relaxed">
                O link acessado é inválido ou o salão não está mais conosco.
            </p>
            <Button className="mt-8" onClick={() => window.location.href = '/'}>Voltar para Início</Button>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-yellow-500/5 blur-[120px] pointer-events-none"></div>
                <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Agendamento Realizado!</h2>
                <div className="max-w-sm w-full bg-zinc-900/50 border border-white/5 p-6 space-y-4 mb-8 text-left">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Serviço</span>
                        <span className="text-xs text-white font-bold">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Data/Hora</span>
                        <span className="text-xs text-white font-bold">{format(parse(selection.date, 'yyyy-MM-dd', new Date()), 'dd/MM')} às {selection.time}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">WhatsApp</span>
                        <span className="text-xs text-yellow-500 font-bold">{clientInfo.phone}</span>
                    </div>
                </div>
                <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold max-w-xs leading-relaxed">
                    Estamos abrindo seu WhatsApp para a confirmação final.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-40 overflow-x-hidden selection:bg-yellow-500 selection:text-black">
            <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 py-8">
                <div className="max-w-4xl mx-auto px-10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1.5 text-black border border-yellow-500/20"><Scissors size={18} /></div>
                        <span className="font-black uppercase tracking-tighter text-white text-xl">{settings.salonName}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-10 pt-20">
                {step === 1 && (
                    <section className="space-y-12 animate-fade-in">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">Escolha seu <br /><span className="text-yellow-500">Serviço</span></h2>
                        {services.length === 0 ? (
                            <div className="py-20 border border-dashed border-white/10 text-center space-y-4">
                                <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum serviço disponível no momento</div>
                                <p className="text-zinc-600 text-[10px] uppercase">Configure seus serviços no painel administrativo.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {services.map(service => (
                                    <button
                                        key={service.id}
                                        onClick={() => { setSelection({ ...selection, serviceId: service.id }); setStep(2); }}
                                        className="group p-8 border border-white/5 bg-zinc-900/40 text-left transition-all hover:border-yellow-500/50"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-black text-white uppercase tracking-wider">{service.name}</h3>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{service.duration} MIN</span>
                                            </div>
                                            <div className="text-xl font-black text-yellow-500">R$ {service.price.toFixed(2)}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {step === 2 && (
                    <section className="space-y-12 animate-fade-in">
                        <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white flex items-center gap-2">
                            <ChevronLeft size={14} /> Voltar
                        </button>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Quem vai <br /><span className="text-yellow-500">Atender?</span></h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {professionals.map(prof => (
                                <button
                                    key={prof.id}
                                    onClick={() => { setSelection({ ...selection, professionalId: prof.id }); setStep(3); }}
                                    className="p-10 border border-white/5 bg-zinc-900/40 flex flex-col items-center gap-6 group hover:border-yellow-500/50 transition-all"
                                >
                                    <div className="w-20 h-20 bg-zinc-950 border-2 border-zinc-800 text-yellow-500 flex items-center justify-center text-3xl font-black group-hover:border-yellow-500">
                                        {prof.name.charAt(0)}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-black text-white uppercase tracking-wider">{prof.name}</h3>
                                        <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">{prof.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section className="space-y-12 animate-fade-in">
                        <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white flex items-center gap-2">
                            <ChevronLeft size={14} /> Voltar
                        </button>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Data e <br /><span className="text-yellow-500">Horário</span></h2>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-10">
                                <input
                                    type="date"
                                    className="input-premium !text-xl !font-black !py-6"
                                    value={selection.date}
                                    min={format(new Date(), 'yyyy-MM-dd')}
                                    onChange={(e) => setSelection({ ...selection, date: e.target.value })}
                                />

                                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                    {availableSlots.map(({ time, isPast, isBooked }) => (
                                        <button
                                            key={time}
                                            disabled={isPast || isBooked}
                                            onClick={() => setSelection({ ...selection, time })}
                                            className={`py-6 text-xs font-black uppercase tracking-widest transition-all border ${selection.time === time
                                                ? 'bg-yellow-500 text-black border-yellow-500'
                                                : (isPast || isBooked)
                                                    ? 'bg-zinc-900/20 border-white/5 text-zinc-800 cursor-not-allowed opacity-30'
                                                    : 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:border-yellow-500/50'
                                                }`}
                                        >
                                            {time}
                                            {isBooked && <div className="text-[7px] mt-1 text-red-900">OCUPADO</div>}
                                            {isPast && !isBooked && <div className="text-[7px] mt-1 text-zinc-700">PASSADO</div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Card className="p-8 border-yellow-500/20 bg-yellow-500/[0.02] space-y-6 h-fit sticky top-40">
                                <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em]">Resumo do Agendamento</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        <span>Serviço</span>
                                        <span className="text-white">{selectedService?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        <span>Profissional</span>
                                        <span className="text-white">{selectedProf?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 pt-4 border-t border-white/5">
                                        <span>Total</span>
                                        <span className="text-yellow-500 text-xl font-black">R$ {selectedService?.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full !py-8 disabled:opacity-20"
                                    disabled={!selection.time}
                                    onClick={() => setStep(4)}
                                >
                                    Próximo Passo
                                </Button>
                            </Card>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section className="space-y-12 animate-fade-in">
                        <button onClick={() => setStep(3)} className="text-[10px] font-black uppercase text-zinc-500 hover:text-white flex items-center gap-2">
                            <ChevronLeft size={14} /> Voltar
                        </button>
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">Seus <br /><span className="text-yellow-500">Dados</span></h2>

                        <div className="max-w-xl space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={clientInfo.name}
                                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                                    className="input-premium"
                                    placeholder="Como quer ser chamado?"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">WhatsApp / Telefone</label>
                                <input
                                    type="text"
                                    value={clientInfo.phone}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 11) val = val.slice(0, 11);
                                        // Mask: (00) 00000-0000
                                        if (val.length > 10) {
                                            val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                                        } else if (val.length > 6) {
                                            val = val.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                                        } else if (val.length > 2) {
                                            val = val.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
                                        } else if (val.length > 0) {
                                            val = val.replace(/^(\d{0,2}).*/, '($1');
                                        }
                                        setClientInfo({ ...clientInfo, phone: val });
                                    }}
                                    className="input-premium"
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>

                            {/* Honeypot Field - Hidden from humans */}
                            <div className="opacity-0 absolute -z-50 pointer-events-none h-0 w-0 overflow-hidden">
                                <input
                                    type="text"
                                    value={honeypot}
                                    onChange={(e) => setHoneypot(e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>


                            <div className="pt-8">
                                <Button
                                    className="w-full !py-10 !text-xl !bg-yellow-500 shadow-[0_20px_50px_rgba(217,119,6,0.1)]"
                                    disabled={!clientInfo.name || clientInfo.phone.length < 14}
                                    onClick={handleBooking}
                                >
                                    Confirmar Agendamento
                                </Button>

                                <p className="text-center text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-6">
                                    Ao confirmar, você concorda com nossos <a href="/termos" target="_blank" className="text-yellow-500 hover:underline">Termos de Uso</a> e <a href="/privacidade" target="_blank" className="text-yellow-500 hover:underline">Política de Privacidade</a>.
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};
