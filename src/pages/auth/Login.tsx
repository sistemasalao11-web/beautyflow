import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Scissors, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            navigate('/admin');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 selection:bg-yellow-500 selection:text-black">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    <div className="bg-yellow-500 p-3 rounded-none text-black inline-block">
                        <Scissors size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">BeautyFlow</h1>
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Acesso Administrativo</p>
                </div>

                <Card className="shimmer-effect border-white/5">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3 text-red-500 animate-fade-in">
                                <AlertCircle size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-premium pl-12"
                                        placeholder="exemplo@gmail.com"
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
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full !py-6 !bg-yellow-500 shadow-lg shadow-yellow-900/20" disabled={loading}>
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <><LogIn size={18} className="mr-2" /> Entrar no Painel</>
                            )}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                    Não tem uma conta? <Link to="/register" className="text-yellow-500 hover:text-yellow-400 transition-colors">Crie seu salão agora</Link>
                </p>
            </div>
        </div>
    );
};
