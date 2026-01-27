import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import {
    TrendingUp,
    Target,
    Activity,
    Users,
    ArrowUpRight,
    Zap,
    Gem,
    BarChart3
} from 'lucide-react';

export const GrowthDashboard = () => {
    const [stats, setStats] = useState({
        totalMRR: 0,
        paidSalons: 0,
        trialSalons: 0,
        conversionRate: 0,
        totalSalons: 0,
        activeSalonsCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGlobalStats = async () => {
            const { data: salons } = await supabase.from('salons').select('plan_type, payment_status, created_at');
            if (!salons) return;

            const paid = salons.filter(s => s.payment_status === 'approved');
            const total = salons.length;

            // MRR Prototyping (Preços do seu novo Tiering)
            const mrr = paid.reduce((sum, s) => {
                const price = s.plan_type === 'elite' ? 197 : s.plan_type === 'profissional' ? 97 : 49;
                return sum + price;
            }, 0);

            setStats({
                totalMRR: mrr,
                paidSalons: paid.length,
                trialSalons: total - paid.length,
                conversionRate: total > 0 ? (paid.length / total) * 100 : 0,
                totalSalons: total,
                activeSalonsCount: total // Mock for now
            });
            setLoading(false);
        };
        fetchGlobalStats();
    }, []);

    if (loading) return <div className="p-20 text-center animate-pulse text-zinc-500 uppercase font-black tracking-widest">Calculando MRR...</div>;

    const KPICard = ({ icon: Icon, label, value, unit, color = "text-yellow-500" }: any) => (
        <Card className="border-white/5 bg-zinc-900/60 p-8 space-y-4">
            <div className="flex justify-between items-start">
                <div className={`p-3 bg-white/5 ${color} border border-white/5`}>
                    <Icon size={20} />
                </div>
                <ArrowUpRight size={14} className="text-zinc-700" />
            </div>
            <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
                <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{unit}</p>
            </div>
        </Card>
    );

    return (
        <div className="space-y-12 animate-fade-in">
            <header>
                <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Zap size={18} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">SaaS Command Center</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">Growth <span className="text-yellow-500 italic">Engine</span></h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    icon={TrendingUp}
                    label="Receita Recorrente (MRR)"
                    value={`R$ ${stats.totalMRR.toLocaleString()}`}
                    unit="RECEITA PROJETADA"
                />
                <KPICard
                    icon={Users}
                    label="Conversão de Trials"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    unit="TAXA DE ATIVAÇÃO PAGA"
                    color="text-blue-500"
                />
                <KPICard
                    icon={Gem}
                    label="Salões Premium"
                    value={stats.paidSalons}
                    unit="ASSINANTES ATIVOS"
                    color="text-emerald-500"
                />
                <KPICard
                    icon={BarChart3}
                    label="Base Total"
                    value={stats.totalSalons}
                    unit="UNIDADES CADASTRADAS"
                    color="text-zinc-500"
                />
            </div>

            <Card className="border-yellow-500/20 bg-yellow-500/5 p-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Roadmap de Expansão</h2>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Sua meta: Aumentar o MRR em 30% nos próximos 30 dias.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-4 bg-zinc-950 border border-white/5">
                            <div className="text-xl font-black text-yellow-500">MVP</div>
                            <div className="text-[8px] text-zinc-600 font-black uppercase">Fase Atual</div>
                        </div>
                        <div className="p-4 bg-zinc-950 border border-white/5 opacity-50">
                            <div className="text-xl font-black text-white">PRO</div>
                            <div className="text-[8px] text-zinc-600 font-black uppercase">Próximo Nível</div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
