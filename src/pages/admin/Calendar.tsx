import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSaaS } from '../../hooks/useSaaS';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle2,
    X,
    Search,
    ShoppingBag,
    Trash2,
    User,
    Scissors,
    UserCheck,
    CreditCard,
    Banknote,
    QrCode
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, Product, Professional, Service, Client } from '../../types/saas';

export const CalendarView = () => {
    const { appointments, products, services, actions, loading, clients, professionals } = useSaaS();
    console.log('[RENDER] CalendarView initialized');
    const location = useLocation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'day' | 'week'>('day');

    // Checkout State
    const [checkoutAppt, setCheckoutAppt] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pointsRedemption, setPointsRedemption] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');

    // New Appointment State
    const [isNewApptOpen, setIsNewApptOpen] = useState(false);
    const [newApptData, setNewApptData] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        serviceId: '',
        professionalId: '',
        date: '',
        time: ''
    });
    const [isQuickClient, setIsQuickClient] = useState(false);

    // Handling direct scheduling from Customers page
    useEffect(() => {
        const state = location.state as { clientId?: string, clientName?: string };
        if (state?.clientId) {
            setNewApptData({
                clientId: state.clientId,
                clientName: state.clientName || '',
                clientPhone: '',
                serviceId: '',
                professionalId: professionals[0]?.id || '',
                date: format(new Date(), 'yyyy-MM-dd'),
                time: '12:00'
            });
            setIsNewApptOpen(true);
            // Clear location state to prevent modal from reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location, professionals]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const startDate = view === 'day' ? currentDate : startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = view === 'day' ? [currentDate] : Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
    const HOURS = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`);


    const addProductToCheckout = async (product: any) => {
        if (!checkoutAppt) return;

        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        };

        // Optimistic UI update
        setCheckoutAppt({
            ...checkoutAppt,
            consumptionItems: [...(checkoutAppt.consumptionItems || []), newItem]
        });

        actions.addConsumptionItem(checkoutAppt.id, newItem);
    };

    const handleSlotClick = (day: Date, time: string) => {
        setNewApptData({
            clientId: '',
            clientName: '',
            clientPhone: '',
            serviceId: '',
            professionalId: '',
            date: format(day, 'yyyy-MM-dd'),
            time: time.split(':')[0]
        });
        setIsQuickClient(false);
        setIsNewApptOpen(true);
    };

    const handleCreateAppt = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let finalClientId = newApptData.clientId;
            let finalClientName = newApptData.clientName;
            let finalClientPhone = newApptData.clientPhone;

            if (isQuickClient) {
                const newClient = await actions.addClient({
                    name: newApptData.clientName,
                    phone: newApptData.clientPhone,
                    totalSpent: 0,
                    fidelityPoints: 0
                });
                if (newClient) {
                    finalClientId = newClient.id;
                    finalClientName = newClient.name;
                    finalClientPhone = newClient.phone;
                }
            } else {
                const existingClient = clients.find((c: Client) => c.id === finalClientId);
                if (existingClient) {
                    finalClientName = existingClient.name;
                    finalClientPhone = existingClient.phone || '';
                }
            }

            // Check for conflicts
            const hasConflict = appointments.some((a: Appointment) =>
                a.professionalId === newApptData.professionalId &&
                a.date === newApptData.date &&
                a.time === newApptData.time &&
                a.status !== 'cancelled'
            );

            if (hasConflict) {
                toast.error('Este profissional já possui um agendamento neste horário!');
                return;
            }

            const selectedService = services.find((s: Service) => s.id === newApptData.serviceId);
            const selectedProf = professionals.find((p: Professional) => p.id === newApptData.professionalId);

            await actions.addAppointment({
                salonId: 'current',
                clientId: finalClientId,
                clientName: finalClientName,
                clientPhone: finalClientPhone,
                professionalId: newApptData.professionalId,
                professionalName: selectedProf?.name || '',
                serviceId: newApptData.serviceId,
                serviceName: selectedService?.name || '',
                totalPrice: selectedService?.price || 0,
                date: newApptData.date,
                time: newApptData.time,
                status: 'pending'
            });
            setIsNewApptOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancelAppt = async () => {
        if (!checkoutAppt) return;
        if (confirm('Cancelar este agendamento?')) {
            await actions.updateStatus(checkoutAppt.id, 'cancelled');
            setCheckoutAppt(null); // Close or refresh
        }
    };

    const clientData = checkoutAppt ? clients.find((c: Client) => c.id === checkoutAppt.clientId) : null;
    const filteredProducts = products.filter((p: Product) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Agenda</h1>
                    <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">Gestão de horários em tempo real</p>
                </div>

                <div className="flex bg-zinc-900/50 p-1 border border-white/5 rounded-lg">
                    <button
                        onClick={() => setView('day')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${view === 'day' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Dia
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-md ${view === 'week' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Semana
                    </button>
                </div>
            </header>

            <Card className="p-0 border-white/5 bg-zinc-900/40 relative overflow-hidden backdrop-blur-sm">
                <div className="flex items-center justify-between p-8 border-b border-white/5 bg-zinc-900/60 sticky top-0 z-20">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, view === 'day' ? -1 : -7))}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter min-w-[200px] text-center">
                            {format(currentDate, view === 'day' ? "EEEE, d 'de' MMMM" : "MMMM yyyy", { locale: ptBR })}
                        </h2>
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, view === 'day' ? 1 : 7))}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <div className={`grid ${view === 'day' ? 'grid-cols-1' : 'grid-cols-7'} divide-x divide-white/5 min-w-[800px] md:min-w-0`}>
                        {days.map((day, dIdx) => (
                            <div key={dIdx} className="min-h-[800px] flex flex-col">
                                <div className="p-4 bg-zinc-950/20 border-b border-white/5 text-center">
                                    <span className={`${isSameDay(day, new Date()) ? 'text-yellow-500' : 'text-zinc-600'} text-[10px] font-black uppercase tracking-widest`}>
                                        {format(day, 'EEE', { locale: ptBR })} {format(day, 'd')}
                                    </span>
                                </div>
                                <div className="relative h-full">
                                    {HOURS.map((hour, hIdx) => {
                                        const apptsInHour = appointments.filter((a: Appointment) =>
                                            isSameDay(day, parseISO(a.date)) && a.time.startsWith(hour.split(':')[0])
                                        );

                                        return (
                                            <div
                                                key={hIdx}
                                                className="h-24 border-b border-white/[0.02] p-2 group transition-colors hover:bg-white/[0.01] cursor-pointer"
                                                onClick={() => handleSlotClick(day, hour)}
                                            >
                                                <span className="text-[9px] font-bold text-zinc-800 uppercase tabular-nums">{hour}</span>
                                                <div className="mt-1 space-y-1">
                                                    {apptsInHour.map((appt: Appointment) => (
                                                        <div
                                                            key={appt.id}
                                                            onClick={(e) => { e.stopPropagation(); setCheckoutAppt(appt); }}
                                                            className={`p-3 border text-left shadow-2xl relative group/item transition-all hover:scale-[1.02] cursor-pointer
                                                            ${appt.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                                    appt.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="font-black text-[10px] uppercase tracking-wider">{appt.clientName}</div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[9px] opacity-70 font-bold uppercase tracking-widest">
                                                                <Clock size={10} /> {appt.time} • {appt.serviceName}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* New Appointment Modal */}
            {isNewApptOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <Card className="w-full max-w-md bg-zinc-950 border-white/10 p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Novo Agendamento</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                    {format(parseISO(newApptData.date), "dd 'de' MMMM", { locale: ptBR })} • {newApptData.time}h
                                </p>
                            </div>
                            <button onClick={() => setIsNewApptOpen(false)} className="text-zinc-600 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleCreateAppt} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <User size={12} /> Cliente
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsQuickClient(!isQuickClient)}
                                        className="text-[9px] font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-500"
                                    >
                                        {isQuickClient ? 'Selecionar Existente' : '+ Novo Cliente'}
                                    </button>
                                </div>

                                {isQuickClient ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <input
                                            type="text"
                                            placeholder="NOME COMPLETO"
                                            className="input-premium"
                                            required
                                            value={newApptData.clientName}
                                            onChange={e => setNewApptData({ ...newApptData, clientName: e.target.value })}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="CELULAR / WHATSAPP"
                                            className="input-premium"
                                            value={newApptData.clientPhone}
                                            onChange={e => setNewApptData({ ...newApptData, clientPhone: e.target.value })}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <select
                                            className="input-premium appearance-none"
                                            required
                                            value={newApptData.clientId}
                                            onChange={e => setNewApptData({ ...newApptData, clientId: e.target.value })}
                                        >
                                            <option value="">SELECIONE CLIENTE</option>
                                            {clients.map((c: Client) => (
                                                <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                            ))}
                                        </select>
                                        {newApptData.clientId && (
                                            <div className="flex justify-between items-center px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in">
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Saldo Fidelidade</span>
                                                <span className="text-[10px] text-yellow-500 font-black">
                                                    {clients.find((c: Client) => c.id === newApptData.clientId)?.fidelityPoints || 0} PTS
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                        Data
                                    </label>
                                    <input
                                        type="date"
                                        className="input-premium"
                                        required
                                        value={newApptData.date}
                                        onChange={e => setNewApptData({ ...newApptData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                        Horário
                                    </label>
                                    <select
                                        className="input-premium appearance-none"
                                        required
                                        value={newApptData.time}
                                        onChange={e => setNewApptData({ ...newApptData, time: e.target.value })}
                                    >
                                        <option value="">HORÁRIO</option>
                                        {HOURS.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Scissors size={12} /> Serviço
                                </label>
                                <select
                                    className="input-premium appearance-none"
                                    required
                                    value={newApptData.serviceId}
                                    onChange={e => setNewApptData({ ...newApptData, serviceId: e.target.value })}
                                >
                                    <option value="">SELECIONE SERVIÇO</option>
                                    {services.map((s: Service) => (
                                        <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <UserCheck size={12} /> Profissional
                                </label>
                                <select
                                    className="input-premium appearance-none"
                                    required
                                    value={newApptData.professionalId}
                                    onChange={e => setNewApptData({ ...newApptData, professionalId: e.target.value })}
                                >
                                    <option value="">SELECIONE PROFISSIONAL</option>
                                    {professionals.map((p: Professional) => (
                                        <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            <Button type="submit" className="w-full !bg-yellow-500 !py-4 uppercase tracking-widest font-black text-xs">
                                Confirmar Agendamento
                            </Button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Checkout Modal */}
            {checkoutAppt && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <Card className="w-full max-w-2xl bg-zinc-950 border-white/5 p-0 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Finalizar Atendimento</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Check-out e Consumo Extra</p>
                            </div>
                            <button onClick={() => { setCheckoutAppt(null); setPointsRedemption(0); setPaymentMethod(''); }} className="text-zinc-600 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="grid grid-cols-2 h-[600px]">
                            {/* Left: Products & Details */}
                            <div className="p-10 border-r border-white/5 overflow-y-auto custom-scrollbar">
                                <div className="space-y-8">
                                    {/* Appointment Info */}
                                    <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 font-black text-lg">
                                                {checkoutAppt.clientName?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white uppercase tracking-wide">{checkoutAppt.clientName || 'Cliente'}</h4>
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">R$ {checkoutAppt.totalPrice.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        {/* Client History / Fidelity / Notes */}
                                        <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="text-zinc-500 font-bold uppercase tracking-widest">Saldo Fidelidade</span>
                                                <span className="text-yellow-500 font-black">{clientData?.fidelityPoints || 0} pts</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products Search */}
                                    <div>
                                        <div className="relative mb-4">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                            <input
                                                type="text"
                                                placeholder="ADICIONAR PRODUTO..."
                                                className="w-full bg-zinc-900 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-[10px] text-white font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-500 transition-colors"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {searchTerm && (
                                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                                {filteredProducts.map((p: Product) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => addProductToCheckout(p)}
                                                        className="w-full flex justify-between items-center p-3 bg-zinc-900/30 hover:bg-zinc-800 border border-white/5 rounded-lg group transition-all"
                                                    >
                                                        <span className="text-[10px] text-zinc-400 group-hover:text-white font-bold uppercase tracking-wide">{p.name}</span>
                                                        <span className="text-[10px] text-yellow-500 font-black">R$ {p.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Consumption List */}
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Resumo do Pedido</p>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Scissors size={14} className="text-yellow-500" />
                                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide">{checkoutAppt.serviceName}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-white">R$ {checkoutAppt.totalPrice}</span>
                                            </div>

                                            {checkoutAppt.consumptionItems?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-zinc-900/30 border border-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <ShoppingBag size={14} className="text-zinc-600" />
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{item.name} <span className="text-zinc-600">x{item.quantity}</span></span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-zinc-300">R$ {item.price * item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Payment & Totals */}
                            <div className="bg-zinc-900/80 p-10 flex flex-col justify-between h-full">
                                <div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-8">Pagamento</h4>

                                    {/* Fidelity Redemption Slider */}
                                    <div className="mb-8 p-4 bg-zinc-950 rounded-lg border border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                                            <span className="text-zinc-500">Resgatar Pontos</span>
                                            <span className="text-yellow-500">{pointsRedemption} pts = R$ {(pointsRedemption * 0.10).toFixed(2)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max={clientData?.fidelityPoints || 0}
                                            step="10"
                                            value={pointsRedemption}
                                            onChange={(e) => setPointsRedemption(Number(e.target.value))}
                                            className="w-full accent-yellow-500 h-1bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[9px] text-zinc-600 font-bold mt-2 uppercase">
                                            <span>0</span>
                                            <span>{clientData?.fidelityPoints || 0} MAX</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between text-[10px] uppercase tracking-widest">
                                            <span className="text-zinc-500 font-bold">Subtotal</span>
                                            <span className="text-zinc-300 font-black">
                                                R$ {(checkoutAppt.totalPrice + (checkoutAppt.consumptionItems?.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                        {pointsRedemption > 0 && (
                                            <div className="flex justify-between text-[10px] uppercase tracking-widest animate-pulse">
                                                <span className="text-yellow-500 font-bold">Desconto Fidelidade</span>
                                                <span className="text-yellow-500 font-black">
                                                    - R$ {(pointsRedemption * 0.10).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="h-px bg-white/10 my-4" />
                                        <div className="flex justify-between text-sm uppercase tracking-widest">
                                            <span className="text-white font-black">Total Final</span>
                                            <span className="text-3xl font-black text-yellow-500 tracking-tighter">
                                                R$ {Math.max(0, (checkoutAppt.totalPrice + (checkoutAppt.consumptionItems?.reduce((s: number, i: any) => s + (i.price * i.quantity), 0) || 0)) - (pointsRedemption * 0.10)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Método de Pagamento</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['PIX', 'DINHEIRO', 'CRÉDITO', 'DÉBITO'].map((method) => (
                                                <button
                                                    key={method}
                                                    onClick={() => setPaymentMethod(method)}
                                                    className={`p-3 text-xs font-bold uppercase border transition-all flex items-center justify-center gap-2
                                                        ${paymentMethod === method
                                                            ? 'bg-yellow-500 text-white border-yellow-500'
                                                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'}`}
                                                >
                                                    {method === 'PIX' && <QrCode size={14} />}
                                                    {method === 'DINHEIRO' && <Banknote size={14} />}
                                                    {(method === 'CRÉDITO' || method === 'DÉBITO') && <CreditCard size={14} />}
                                                    {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {checkoutAppt.status === 'pending' ? (
                                        <div className="space-y-4">
                                            <button
                                                disabled={!paymentMethod}
                                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 transition-all"
                                                onClick={async () => {
                                                    const success = await actions.completeAppointment(checkoutAppt.id, paymentMethod, pointsRedemption * 0.10, pointsRedemption);
                                                    if (success) {
                                                        setCheckoutAppt({ ...checkoutAppt, status: 'completed' });
                                                    }
                                                }}
                                            >
                                                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                                CONFIRMAR PAGAMENTO
                                            </button>
                                            <button
                                                onClick={handleCancelAppt}
                                                className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Cancelar Agendamento
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-emerald-950/30 border border-emerald-500/30 flex flex-col items-center justify-center gap-4">
                                            <div>
                                                <p className="text-emerald-400 font-black uppercase tracking-widest text-sm mb-1">Pagamento Confirmado</p>
                                                <p className="text-emerald-600 text-[10px] font-bold">Atendimento Finalizado com Sucesso</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setCheckoutAppt(null);
                                                    setPointsRedemption(0);
                                                    setPaymentMethod('');
                                                }}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105"
                                            >
                                                OK, FECHAR
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
