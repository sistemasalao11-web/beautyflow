import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Settings,
    ExternalLink,
    Scissors,
    Users,
    Package,
    BarChart3,
    Calendar,
    LogOut,
    Bell,
    Menu,
    X,
    Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSaaS } from '../hooks/useSaaS';
import { toast } from 'react-hot-toast';

export const AdminLayout = () => {
    const location = useLocation();
    const { signOut } = useAuth();
    const { permissions, actions, status, error: saasError } = useSaaS();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 1. ALL HOOKS MUST BE DECLARED AT THE TOP
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Handle Payment Return hook must always run
    useEffect(() => {
        const pStatus = searchParams.get('status');
        const paymentId = searchParams.get('payment_id');

        if (pStatus === 'approved' && paymentId && permissions?.isTrial) {
            actions.activatePlan(paymentId);
            // Clean URL
            navigate(location.pathname, { replace: true });
        }
    }, [searchParams, permissions?.isTrial, actions, navigate, location.pathname]);

    // 2. STABLE HELPERS
    const activeStyle = 'bg-yellow-500 text-black font-black shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-[1.02]';
    const inactiveStyle = 'text-zinc-500 hover:text-zinc-100 hover:bg-white/5';

    const isActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin' ? activeStyle : inactiveStyle;
        return location.pathname.startsWith(path) ? activeStyle : inactiveStyle;
    };

    // 3. CONDITIONAL UI RENDERING (AFTER ALL HOOKS)
    if (status === 'loading' || status === 'syncing') {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="h-12 w-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-6"></div>
                <h2 className="text-white font-black uppercase tracking-tighter italic text-xl">Sincronizando BeautyFlow</h2>
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Preparando seu ambiente de alta performance...</p>
            </div>
        );
    }

    if (status === 'error') {
        console.error('[RENDER BLOCKED] SaaS Sync Error', saasError);
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 mb-8">
                    <X size={48} className="mx-auto" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Erro de Sincronização</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">
                    Não conseguimos conectar com o servidor. Verifique sua conexão ou tente novamente.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (status === 'no-salon') {
        console.error('[RENDER BLOCKED] No Salon Found');
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
                <div className="bg-yellow-500 p-4 text-black mb-8">
                    <Scissors size={48} className="mx-auto" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Perfil Não Encontrado</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10">
                    Sua conta ainda não possui um salão configurado. Vamos criar sua unidade agora?
                </p>
                <div className="space-y-4 w-full">
                    <button
                        onClick={() => actions.refresh()}
                        className="w-full bg-yellow-500 text-black py-4 text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
                    >
                        Inicializar Meu Salão
                    </button>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-zinc-600 hover:text-white py-2 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        Sair e Logar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-950 font-sans selection:bg-yellow-500 selection:text-black overflow-hidden relative">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] md:hidden animate-fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div className="p-10 space-y-8" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-4">
                                <div className="bg-yellow-500 p-2 text-black">
                                    <Scissors size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">BeautyFlow</h2>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-500 hover:text-white">
                                <X size={32} />
                            </button>
                        </div>
                        <nav className="flex flex-col gap-6">
                            {[
                                { to: '/admin', icon: BarChart3, label: 'Dashboard' },
                                { to: '/admin/agenda', icon: Calendar, label: 'Agenda Viva' },
                                { to: '/admin/services', icon: LayoutDashboard, label: 'Serviços' },
                                { to: '/admin/barbers', icon: Users, label: 'Especialistas' },
                                { to: '/admin/customers', icon: Users, label: 'Clientes (CRM)' },
                                ...(permissions.canAccessInventory ? [{ to: '/admin/inventory', icon: Package, label: 'Inventário' }] : []),
                                { to: '/admin/settings', icon: Settings, label: 'Preferências' },
                            ].map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4 uppercase tracking-widest text-xs font-black ${location.pathname === item.to ? 'text-yellow-500 bg-yellow-500/10' : 'text-zinc-500'}`}
                                >
                                    <item.icon size={20} /> {item.label}
                                </Link>
                            ))}
                        </nav>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-4 px-6 py-8 text-red-500 uppercase text-xs font-black tracking-widest border-t border-white/5 mt-auto"
                        >
                            <LogOut size={20} /> Sair do Painel
                        </button>
                    </div>
                </div>
            )}

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-72 lg:w-80 bg-[#09090b] border-r border-white/5 p-8 lg:p-10 flex-col h-full shrink-0">
                <div className="mb-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-500 p-2 text-black border border-yellow-400/20">
                            <Scissors size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">Beauty</h2>
                            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.4em] block -mt-1">Flow Elite</span>
                        </div>
                    </div>
                </div>

                <nav className="space-y-4 flex-1">
                    <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] block mb-6 px-4">Menu Principal</span>

                    <Link to="/admin" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin')}`}>
                        <BarChart3 size={18} /> Dashboard
                    </Link>

                    <Link to="/admin/agenda" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/agenda')}`}>
                        <Calendar size={18} /> Agenda Viva
                    </Link>

                    <Link to="/admin/services" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/services')}`}>
                        <LayoutDashboard size={18} /> Serviços
                    </Link>

                    <Link to="/admin/barbers" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/barbers')}`}>
                        <Users size={18} /> Especialistas
                    </Link>

                    <Link to="/admin/customers" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/customers')}`}>
                        <Users size={18} /> Clientes (CRM)
                    </Link>

                    {permissions.canAccessInventory && (
                        <Link to="/admin/inventory" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/inventory')}`}>
                            <Package size={18} /> Inventário
                        </Link>
                    )}

                    <div className="pt-10 pb-4">
                        <span className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.4em] block mb-6 px-4">Configurações</span>
                        <Link to="/admin/settings" className={`flex items-center gap-4 px-6 py-4 transition-all duration-300 uppercase tracking-widest text-[10px] rounded-none ${isActive('/admin/settings')}`}>
                            <Settings size={18} /> Preferências
                        </Link>
                    </div>
                </nav>

                <div className="pt-8 space-y-4 mt-auto border-t border-white/5">
                    <Link to="/" target="_blank" className="flex items-center justify-between px-6 py-4 bg-zinc-900/50 border border-white/5 text-zinc-400 hover:text-white transition-all group">
                        <span className="text-[10px] font-black uppercase tracking-widest">Ver site público</span>
                        <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-4 px-6 py-4 text-zinc-600 hover:text-red-500 transition-colors uppercase text-[10px] font-black tracking-widest"
                    >
                        <LogOut size={16} /> Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
                {/* Topbar inside main content */}
                <header className="h-16 md:h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-10 lg:px-12 shrink-0 bg-zinc-950/80 backdrop-blur-md z-40">
                    <div className="flex items-center gap-4 md:gap-2">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sistema Operacional</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 md:gap-6">
                        <button
                            onClick={() => toast.success('Todas as notificações foram lidas.', { icon: '🔔' })}
                            className="p-2 text-zinc-500 hover:text-white relative transition-colors"
                        >
                            <Bell size={18} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full border-2 border-zinc-950"></span>
                        </button>
                        <div className="h-6 md:h-8 w-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <div className="text-[10px] font-black text-white uppercase tracking-tighter">Administrador</div>
                                <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Sessão Ativa</div>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-900 border border-white/5 flex items-center justify-center text-yellow-500 font-black text-xs md:text-sm uppercase">BF</div>
                        </div>
                    </div>
                </header>

                {/* Trial Banner */}
                {permissions.isTrial && !permissions.isTrialExpired && (
                    <div className="bg-yellow-500 py-2.5 px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 animate-fade-in shadow-[0_4px_20px_rgba(234,179,8,0.1)] shrink-0 z-30">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest text-center">
                            🎁 Período de Teste: você tem {permissions.trialDaysRemaining} {permissions.trialDaysRemaining === 1 ? 'dia' : 'dias'} restante(s) com todas as funcionalidades liberadas!
                        </span>
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className="text-[9px] bg-black text-white px-4 py-1.5 font-black uppercase tracking-tighter hover:scale-105 transition-transform"
                        >
                            Ativar Assinatura Premium
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto scrollbar-hide relative">
                    {/* Trial Expired Lock */}
                    {permissions.isTrialExpired && (
                        <div className="absolute inset-0 z-[50] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
                            <div className="max-w-md w-full text-center space-y-8">
                                <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <Lock size={48} className="text-red-500" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-tight">Trial <br /><span className="text-red-500">Expirado</span></h2>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        Seus 7 dias gratuitos chegaram ao fim. Ative um dos nossos planos premium para continuar gerenciando sua barbearia.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => navigate('/admin/settings')}
                                        className="w-full bg-yellow-500 text-black py-6 font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:scale-[1.02] transition-all"
                                    >
                                        Escolher Plano & Ativar
                                    </button>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full text-zinc-600 hover:text-white py-4 font-black uppercase tracking-widest text-[10px] transition-colors"
                                    >
                                        Sair do Painel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};
