import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CheckoutModal } from '../../components/CheckoutModal';
import {
    Scissors,
    Smartphone,
    Zap,
    ShieldCheck,
    ArrowRight,
    Check,
    MessageCircle,
    Star,
    BarChart3
} from 'lucide-react';

export const LandingPage = () => {
    const [selectedPlan, setSelectedPlan] = useState<{ id: 'iniciante' | 'profissional' | 'elite', name: string, price: string, features: string[] } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openCheckout = (id: 'iniciante' | 'profissional' | 'elite', name: string, price: string, features: string[]) => {
        setSelectedPlan({ id, name, price, features });
        setIsModalOpen(true);
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 font-sans selection:bg-yellow-500 selection:text-black">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1.5 text-black">
                            <Scissors size={20} />
                        </div>
                        <span className="font-black uppercase tracking-tighter text-xl">Beauty<span className="text-yellow-500">Flow</span></span>
                    </div>
                    <div className="hidden md:flex gap-8 items-center text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <a href="#features" className="hover:text-yellow-500 transition-colors">Funcionalidades</a>
                        <a href="#pricing" className="hover:text-yellow-500 transition-colors">Preços</a>
                        <Link to="/admin" className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 transition-all">Área do Barbeiro</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(var(--color-primary),0.08),transparent_70%)] pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-none text-yellow-500 text-[10px] font-black uppercase tracking-[0.3em] animate-fade-in">
                        <Zap size={14} /> Sistema Nº1 para Barbeiros Premier
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9] animate-slide-up">
                        Transforme sua <span className="text-yellow-500">Agenda</span> em uma Máquina de Vendas
                    </h1>

                    <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto uppercase tracking-wide font-medium leading-relaxed">
                        O sistema de agendamento via WhatsApp que sua barbearia merece. Elegante, rápido e 100% focado em conversão.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                        <Link to="/register">
                            <Button className="!px-12 !py-8 !text-lg !bg-yellow-500 shadow-[0_0_30px_rgba(var(--color-primary),0.2)]">
                                Criar Minha Barbearia <ArrowRight size={20} className="ml-2" />
                            </Button>
                        </Link>
                        <a href="#pricing">
                            <Button variant="secondary" className="!px-12 !py-8 !text-lg !border-white/10 !bg-transparent hover:!bg-white/5">
                                Ver Planos e Preços
                            </Button>
                        </a>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-32 space-y-20">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Por que escolher o <span className="text-yellow-500 font-serif lowercase italic">BeautyFlow?</span></h2>
                    <div className="h-1 w-20 bg-yellow-500 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="!bg-zinc-900/40 border-white/5 space-y-6 hover:border-yellow-500/30 transition-all group">
                        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Agendamento Mobile</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest font-bold text-[10px]">Interface ultra-rápida otimizada para o celular do seu cliente. Agendamento em menos de 30 segundos.</p>
                    </Card>

                    <Card className="!bg-zinc-900/40 border-white/5 space-y-6 hover:border-yellow-500/30 transition-all group">
                        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">WhatsApp Direto</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest font-bold text-[10px]">Receba o pedido de agendamento formatado no seu WhatsApp. Sem intermediários, sem taxas por agendamento.</p>
                    </Card>

                    <Card className="!bg-zinc-900/40 border-white/5 space-y-6 hover:border-yellow-500/30 transition-all group">
                        <div className="w-12 h-12 bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-tight">Painel Premium</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed uppercase tracking-widest font-bold text-[10px]">Gerencie seus serviços e profissionais com extrema facilidade. Tudo sob seu controle em tempo real.</p>
                    </Card>
                </div>
            </section>

            {/* Social Proof / Stats */}
            <section className="bg-zinc-900/50 py-24 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-12 text-center">
                    <div className="space-y-2">
                        <div className="text-4xl font-black text-white">+500</div>
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Agendamentos/Dia</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-4xl font-black text-yellow-500">ZERO</div>
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Taxas Ocultas</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-4xl font-black text-white">100%</div>
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Foco em Conversão</div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-4xl font-black text-white">24/7</div>
                        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Site Online</div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="max-w-7xl mx-auto px-6 py-32 space-y-20">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Preços <span className="text-yellow-500">Imbatíveis</span></h2>
                    <p className="text-zinc-500 uppercase tracking-widest text-xs font-bold">A melhor tecnologia com o menor custo do mercado</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* Basic */}
                    <div className="p-8 border border-white/5 bg-zinc-950 space-y-8 transition-all hover:scale-105">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase text-zinc-400">Iniciante</h3>
                            <div className="text-4xl font-black text-white">R$ 49,90<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
                        </div>
                        <ul className="space-y-4 text-sm text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> 1 Profissional</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Serviços Ilimitados</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Agendamento via WhatsApp</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Suporte via E-mail</li>
                        </ul>
                        <Button
                            variant="secondary"
                            className="w-full !py-4"
                            onClick={() => openCheckout('iniciante', 'Iniciante', '49,90', ['1 Profissional', 'Serviços Ilimitados', 'Agendamento via WhatsApp', 'Suporte via E-mail'])}
                        >
                            Assinar Agora
                        </Button>
                    </div>

                    {/* Pro */}
                    <div className="p-10 border-2 border-yellow-500 bg-zinc-900 relative space-y-8 md:scale-110 z-10 shadow-[0_0_50px_rgba(217,119,6,0.1)]">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-500 text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest">Melhor Custo-Benefício</div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase text-yellow-500">Profissional</h3>
                            <div className="text-5xl font-black text-white">R$ 89,90<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
                        </div>
                        <ul className="space-y-4 text-sm text-zinc-300 font-bold uppercase tracking-widest text-[11px]">
                            <li className="flex items-center gap-3"><Check size={16} className="text-yellow-500" /> Até 5 Profissionais</li>
                            <li className="flex items-center gap-3"><Check size={16} className="text-yellow-500" /> Controle de Estoque</li>
                            <li className="flex items-center gap-3"><Check size={16} className="text-yellow-500" /> Sistema de Fidelidade</li>
                            <li className="flex items-center gap-3"><Check size={16} className="text-yellow-500" /> Suporte Prioritário</li>
                        </ul>
                        <Button
                            className="w-full !py-6 !bg-yellow-500"
                            onClick={() => openCheckout('profissional', 'Profissional', '89,90', ['Até 5 Profissionais', 'Controle de Estoque', 'Sistema de Fidelidade', 'Suporte Prioritário'])}
                        >
                            Assinar Plano PRO
                        </Button>
                    </div>

                    {/* Elite */}
                    <div className="p-8 border border-white/5 bg-zinc-950 space-y-8 transition-all hover:scale-105">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase text-zinc-400">Elite</h3>
                            <div className="text-4xl font-black text-white">R$ 180,00<span className="text-lg text-zinc-500 font-normal">/mês</span></div>
                        </div>
                        <ul className="space-y-4 text-sm text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Profissionais Ilimitados</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Relatórios de Performance</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Cashback para Clientes</li>
                            <li className="flex items-center gap-3"><Check size={14} className="text-yellow-500" /> Gerente de Conta Dedicado</li>
                        </ul>
                        <Button
                            variant="secondary"
                            className="w-full !py-4"
                            onClick={() => openCheckout('elite', 'Elite', '180,00', ['Profissionais Ilimitados', 'Relatórios de Performance', 'Cashback para Clientes', 'Gerente de Conta Dedicado'])}
                        >
                            Assinar Plano Elite
                        </Button>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-6">
                        <div className="flex gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">"Aumentei meu faturamento em 40% no primeiro mês com a facilidade do agendamento."</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-yellow-500">RM</div>
                            <div>
                                <div className="text-white font-bold uppercase tracking-widest text-sm">Rodrigo Mendes</div>
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Dono da Mendes Barber Club</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900 p-8 space-y-2">
                            <BarChart3 size={32} className="text-yellow-500" />
                            <div className="text-2xl font-black text-white">4.8k</div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Clientes Ativos</div>
                        </div>
                        <div className="bg-zinc-900 p-8 space-y-2 mt-8">
                            <Zap size={32} className="text-yellow-500" />
                            <div className="text-2xl font-black text-white">2.1s</div>
                            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Tempo de Resposta</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-yellow-500 py-32 px-6 text-center text-black selection:bg-black selection:text-white">
                <div className="max-w-3xl mx-auto space-y-8">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Pare de perder clientes agora.</h2>
                    <p className="text-black/70 font-bold uppercase tracking-widest text-sm max-w-xl mx-auto">Leve sua barbearia para o próximo nível com a melhor tecnologia do mercado.</p>
                    <Link to="/register" className="inline-block">
                        <Button className="!bg-black !text-yellow-500 !px-16 !py-10 !text-xl !font-black hover:scale-105 transition-transform">
                            Começar Agora Gratuitamente
                        </Button>
                    </Link>
                </div>
            </section>

            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 p-1.5 text-black">
                            <Scissors size={20} />
                        </div>
                        <span className="font-black uppercase tracking-tighter text-xl">Beauty<span className="text-yellow-500 text-serif italic lowercase tracking-normal">Flow</span></span>
                    </div>
                    <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.4em]">
                        &copy; 2025 BeautyFlow &bull; Design by Modern Excellence
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                        <Link to="/termos" className="hover:text-yellow-500 transition-colors">Termos de Uso</Link>
                        <Link to="/privacidade" className="hover:text-yellow-500 transition-colors">Privacidade</Link>
                        <a href="#features" className="hover:text-yellow-500 transition-colors">Funcionalidades</a>
                    </div>
                    <div className="flex gap-6 text-zinc-500">
                        <a href="#" className="hover:text-white"><Smartphone size={18} /></a>
                        <a href="#" className="hover:text-white"><MessageCircle size={18} /></a>
                    </div>
                </div>
            </footer>

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
            />
        </div>
    );
};
