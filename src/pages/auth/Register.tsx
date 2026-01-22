import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Mail, Lock, Building2, Rocket, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [salonName, setSalonName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    // Redirecionar se já estiver logado
    useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

    // Payment validation logic
    const paymentId = searchParams.get('payment_id');
    const paymentStatus = searchParams.get('status');
    const isApproved = paymentStatus === 'approved';

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Wait for session to be established
                await new Promise(resolve => setTimeout(resolve, 1000));

                // 2. Create the Salon record
                const { error: salonError } = await supabase
                    .from('salons')
                    .insert({
                        owner_id: authData.user.id,
                        name: salonName,
                        slug: salonName.toLowerCase().trim().replace(/\s+/g, '-'),
                        theme_color: '#EAB308',
                        last_payment_id: paymentId,
                        payment_status: paymentStatus,
                        whatsapp: '' // Initialize empty
                    });

                if (salonError) {
                    // Se o erro for de RLS, pode ser que o usuário não tenha sessão ativa ainda ou e-mail precise confirmar
                    if (salonError.message.includes('row-level security') || salonError.code === '42501') {
                        throw new Error('Conta criada com sucesso, mas houve um erro ao configurar sua barbearia. Por favor, tente fazer Login para finalizar a configuração automaticamente.');
                    }
                    throw salonError;
                }

                navigate('/admin');
            }
        } catch (err: any) {
            console.error('[AUTH_REGISTER] Failed:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-yellow-500 selection:text-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="bg-yellow-500 p-3 rounded-none text-black inline-block">
                        <Rocket size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">Começar Agora</h1>
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Crie seu ecossistema digital</p>
                </div>

                <Card className="shimmer-effect border-white/5">
                    <form onSubmit={handleRegister} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3 text-red-500 animate-fade-in">
                                <AlertCircle size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isApproved && (
                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 mb-2">
                                    <p className="text-[9px] text-yellow-500 font-black uppercase tracking-widest text-center">
                                        🎁 Você ganhou 7 dias de Trial Grátis!
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Nome do Salão/Barbearia</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="text"
                                        value={salonName}
                                        onChange={(e) => setSalonName(e.target.value)}
                                        className="input-premium pl-12"
                                        placeholder="Barber Shop Platinum"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-premium pl-12"
                                        placeholder="dono@exemplo.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-premium pl-12"
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full !py-6 !bg-yellow-500 shadow-lg shadow-yellow-900/20" disabled={loading}>
                            <div className="flex items-center justify-center min-h-[24px]">
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Rocket size={18} className="mr-2" />
                                        <span>{isApproved ? 'Finalizar Cadastro' : 'Iniciar 7 Dias Grátis'}</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                    Já tem conta? <Link to="/login" className="text-yellow-500 hover:text-yellow-400 transition-colors">Entrar agora</Link>
                </p>
            </div>
        </div>
    );
};
