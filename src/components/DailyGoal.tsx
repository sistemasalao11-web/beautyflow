import React from 'react';
import { useSaaS } from '../hooks/useSaaS';
import { Card } from './ui/Card';
import { Zap, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const DailyGoal = () => {
    const { appointments } = useSaaS();

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });

    const getStats = (dateStr?: string, range?: { start: Date, end: Date }) => {
        const filtered = appointments.filter(a => {
            if (dateStr) return a.date === dateStr && a.status !== 'cancelled';
            if (range) {
                const apptDate = new Date(a.date);
                return isWithinInterval(apptDate, range) && a.status !== 'cancelled';
            }
            return false;
        });

        const revenue = filtered.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);
        return { count: filtered.length, revenue };
    };

    const today = getStats(todayStr);
    const tomorrow = getStats(tomorrowStr);
    const week = getStats(undefined, { start: startOfCurrentWeek, end: endOfCurrentWeek });

    const BigCard = ({ label, count, revenue, highlight = false, type = "garantidos" }: any) => (
        <Card className={`p-8 border-white/5 bg-zinc-900/40 relative overflow-hidden group transition-all`}>
            {highlight && (
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Zap size={80} fill="currentColor" className="text-yellow-500" />
                </div>
            )}
            <div className="space-y-4 relative z-10">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] block">
                    {label}
                </span>
                <div className="space-y-1">
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic leading-none max-w-sm">
                        {count} agendamentos =
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl md:text-5xl font-black text-yellow-500 tracking-tighter">
                            R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            {type}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in w-full max-w-6xl mx-auto">
            {/* BLOCO 1: HOJE */}
            <BigCard
                label="Hoje"
                count={today.count}
                revenue={today.revenue}
                highlight
                type="garantidos"
            />

            {/* BLOCO 2 & 3: GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BigCard
                    label="Amanhã"
                    count={tomorrow.count}
                    revenue={tomorrow.revenue}
                    type="previstos"
                />
                <BigCard
                    label="Esta Semana"
                    count={week.count}
                    revenue={week.revenue}
                    type="em faturamento potencial"
                />
            </div>

            {/* BLOCO 4: NO-SHOW */}
            <div className="p-6 bg-red-500/5 border border-red-500/10 flex items-center justify-between group grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-none border border-red-500/20">
                        <AlertCircle size={18} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Inteligência No-Show</span>
                        <span className="text-xs font-black text-white uppercase tracking-tighter">Taxa de faltas este mês: em breve</span>
                    </div>
                </div>
                <div className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest border border-white/5 px-2 py-1">Beta</div>
            </div>
        </div>
    );
};
