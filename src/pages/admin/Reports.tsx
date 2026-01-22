import { useState } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import {
    TrendingUp,
    Calendar,
    Ticket,
    Activity,
    Clock,
    X,
    ArrowUpRight,
    Users,
    ClipboardList,
    DollarSign,
    Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Reports = () => {
    const { metrics, loading } = useSaaS();
    console.log('[RENDER] Reports Page initialized');
    const navigate = useNavigate();
    const [detailView, setDetailView] = useState<{
        isOpen: boolean;
        title: string;
        type: 'revenue' | 'appointments' | 'completion' | 'status' | 'ticket';
    }>({ isOpen: false, title: '', type: 'revenue' });

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="h-8 w-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    const openDetails = (title: string, type: typeof detailView['type']) => {
        setDetailView({ isOpen: true, title, type });
    };

    const MetricCard = ({
        icon: Icon,
        label,
        value,
        unit = '',
        onClick,
        colorClass = 'text-yellow-500',
        bgClass = 'bg-yellow-500/10',
        borderClass = 'border-yellow-500/20'
    }: any) => (
        <button
            onClick={onClick}
            className="w-full text-left group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        >
            <Card className={`relative overflow-hidden border-white/5 bg-zinc-900/60 p-6 md:p-8 h-full flex flex-col justify-between hover:border-yellow-500/30 transition-all min-h-[180px]`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 ${bgClass} ${colorClass} rounded-none border ${borderClass}`}>
                        <Icon size={20} />
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <ArrowUpRight size={16} className={colorClass} />
                    </div>
                </div>
                <div className="mt-auto">
                    <span className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest block leading-tight mb-2">
                        {label}
                    </span>
                    <div className="flex flex-col gap-1 min-w-0">
                        <div className="text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tighter leading-none break-words">
                            {value}
                        </div>
                        {unit && <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{unit}</span>}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            </Card>
        </button>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 relative px-4 md:px-0">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                    Performance <span className="text-yellow-500">Analytics</span>
                </h1>
                <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold">Monitoramento de kpis em tempo real da unidade</p>
            </header>

            {/* Main Stats Grid - 100% Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <MetricCard
                    icon={TrendingUp}
                    label="Faturamento Total"
                    value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    onClick={() => openDetails('Detalhamento de Faturamento', 'revenue')}
                />
                <MetricCard
                    icon={Calendar}
                    label="Volume Agendamentos"
                    value={metrics.totalAppointments}
                    unit="TOTAIS"
                    onClick={() => openDetails('Histórico de Agendamentos', 'appointments')}
                />
                <MetricCard
                    icon={Target}
                    label="Taxa de Conclusão"
                    value={`${metrics.completionRate.toFixed(1)}%`}
                    colorClass="text-emerald-500"
                    bgClass="bg-emerald-600/10"
                    borderClass="border-emerald-600/20"
                    onClick={() => openDetails('Análise de Retenção', 'completion')}
                />
                <MetricCard
                    icon={Ticket}
                    label="Ticket Médio"
                    value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    onClick={() => openDetails('Performance de Vendas', 'ticket')}
                />
            </div>

            {/* Status Hoje Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Card className="xl:col-span-2 border-white/5 bg-zinc-900/40 p-6 md:p-10 space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Status da Operação Hoje</h3>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Distribuição por status rls real-time</p>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black tracking-widest bg-zinc-950 px-4 py-2 border border-white/5 uppercase shrink-0">
                            <Clock size={12} className="text-yellow-500" /> Live Data
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <button
                            onClick={() => openDetails('Agendamentos Pendentes (Hoje)', 'status')}
                            className="text-left group transition-all"
                        >
                            <div className="p-4 md:p-6 lg:p-8 bg-zinc-950/50 border border-white/5 space-y-3 group-hover:border-yellow-500/30 transition-all h-full flex flex-col justify-center min-h-[140px]">
                                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-yellow-500 tracking-tighter leading-none">{metrics.statusToday.pending}</div>
                                <div className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pendentes</div>
                            </div>
                        </button>
                        <button
                            onClick={() => openDetails('Agendamentos Concluídos (Hoje)', 'status')}
                            className="text-left group transition-all"
                        >
                            <div className="p-4 md:p-6 lg:p-8 bg-zinc-950/50 border border-white/5 space-y-3 group-hover:border-emerald-600/30 transition-all h-full flex flex-col justify-center min-h-[140px]">
                                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-emerald-500 tracking-tighter leading-none">{metrics.statusToday.completed}</div>
                                <div className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest">Concluídos</div>
                            </div>
                        </button>
                        <button
                            onClick={() => openDetails('Agendamentos Cancelados (Hoje)', 'status')}
                            className="text-left group transition-all"
                        >
                            <div className="p-4 md:p-6 lg:p-8 bg-zinc-950/50 border border-white/5 space-y-3 group-hover:border-red-600/30 transition-all h-full flex flex-col justify-center min-h-[140px]">
                                <div className="text-2xl md:text-3xl lg:text-4xl font-black text-red-500 tracking-tighter leading-none">{metrics.statusToday.cancelled}</div>
                                <div className="text-[9px] md:text-[10px] text-zinc-500 font-black uppercase tracking-widest">Cancelados</div>
                            </div>
                        </button>
                    </div>
                </Card>

                <div className="bg-yellow-500 p-10 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 text-black/10 transition-transform group-hover:rotate-12 duration-700">
                        <Activity size={200} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 bg-black text-yellow-500 flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black text-black uppercase tracking-tighter">Fluxo de Clientes</h4>
                            <p className="text-[11px] text-black/60 uppercase leading-relaxed font-black tracking-widest">
                                Baseado na sua taxa de {metrics.completionRate.toFixed(0)}%, recomendamos {metrics.completionRate < 70 ? 'focar em fidelização.' : 'expandir horários.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="relative z-10 w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-900 transition-colors"
                    >
                        Gerar Report PDF
                    </button>
                </div>
            </div>

            {/* Detail Panel (Drawer Implementation) */}
            {detailView.isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm animate-fade-in flex justify-end"
                    onClick={() => setDetailView({ ...detailView, isOpen: false })}
                >
                    <div
                        className="w-full max-w-2xl bg-zinc-950 border-l border-white/10 h-full overflow-y-auto animate-slide-left shadow-[-50px_0_100px_rgba(0,0,0,0.5)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 md:p-12 space-y-12">
                            <header className="flex justify-between items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-yellow-500">
                                        <ClipboardList size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Analytics Detail</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none">{detailView.title}</h2>
                                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Resultados extraídos diretamente do Supabase Cloud</p>
                                </div>
                                <button
                                    onClick={() => setDetailView({ ...detailView, isOpen: false })}
                                    className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </header>

                            <div className="space-y-4">
                                {detailView.type === 'revenue' && (
                                    <div className="space-y-4">
                                        <div className="p-8 bg-zinc-900 border border-white/5 flex justify-between items-center mb-10">
                                            <div className="space-y-1">
                                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Total no Período</span>
                                                <div className="text-4xl font-black text-yellow-500 tracking-tighter">R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                            </div>
                                            <DollarSign size={40} className="text-zinc-800" />
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 px-1">Últimas Transações</h4>
                                        <div className="space-y-1">
                                            {metrics.details.revenue.map((rev: any) => (
                                                <div key={rev.id} className="p-6 bg-zinc-900/40 border border-white/5 flex justify-between items-center hover:bg-zinc-900 transition-colors">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-wider">{rev.client}</div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{rev.service} • {format(new Date(rev.date), "dd MMM", { locale: ptBR })}</div>
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-500">+ R$ {rev.value.toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailView.type === 'appointments' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 mb-10">
                                            <div className="p-8 bg-zinc-900 border border-white/5">
                                                <div className="text-3xl font-black text-white">{metrics.totalAppointments}</div>
                                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Geral</div>
                                            </div>
                                            <div className="p-8 bg-zinc-900 border border-white/5">
                                                <div className="text-3xl font-black text-emerald-500">{metrics.completionRate.toFixed(1)}%</div>
                                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Aproveitamento</div>
                                            </div>
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 px-1">Lista de Atendimentos</h4>
                                        <div className="space-y-1">
                                            {metrics.details.appointments.map((appt: any) => (
                                                <div key={appt.id} className="p-6 bg-zinc-900/40 border border-white/5 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-wider">{appt.client}</div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{appt.service} • {appt.time}</div>
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${appt.status === 'completed' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' :
                                                        appt.status === 'cancelled' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                                                            'border-yellow-500/20 text-yellow-500 bg-yellow-500/5'
                                                        }`}>
                                                        {appt.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailView.type === 'status' && (
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest px-1">Pendentes de Hoje</h4>
                                            {metrics.statusToday.lists.pending.map((a: any) => (
                                                <div key={a.id} className="p-4 bg-yellow-500/5 border border-yellow-500/10 flex justify-between items-center group">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-wider">{a.clientName}</div>
                                                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{a.serviceName} • {a.time}</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/clientes?search=${a.clientName}`);
                                                        }}
                                                        className="text-[9px] font-black text-yellow-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        Ver Contato
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">Concluídos Hoje</h4>
                                            {metrics.statusToday.lists.completed.map((a: any) => (
                                                <div key={a.id} className="p-4 bg-zinc-900 border border-white/5 flex justify-between items-center grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-wider">{a.clientName}</div>
                                                        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{a.serviceName} • {a.time}</div>
                                                    </div>
                                                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">FINALIZADO</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(detailView.type === 'completion' || detailView.type === 'ticket') && (
                                    <div className="space-y-4">
                                        <div className="p-8 bg-zinc-900 border border-white/5 mb-10 text-center">
                                            <div className="text-3xl font-black text-white">{detailView.type === 'completion' ? `${metrics.completionRate.toFixed(1)}%` : `R$ ${metrics.averageTicket.toFixed(2)}`}</div>
                                            <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{detailView.type === 'completion' ? 'Taxa Atual' : 'Ticket Médio'}</div>
                                        </div>
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 px-1">Registros Recentes</h4>
                                        <div className="space-y-1">
                                            {metrics.details.appointments.slice(0, 10).map((appt: any) => (
                                                <div key={appt.id} className="p-6 bg-zinc-900/40 border border-white/5 flex justify-between items-center px-4">
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase tracking-wider">{appt.client}</div>
                                                        <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{appt.service}</div>
                                                    </div>
                                                    <div className="text-[9px] font-black text-zinc-500 uppercase">{appt.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
