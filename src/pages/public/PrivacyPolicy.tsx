import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Lock } from 'lucide-react';

export const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans p-6 md:p-20">
            <div className="max-w-4xl mx-auto space-y-12">
                <Button variant="secondary" onClick={() => navigate(-1)} className="!bg-zinc-900 border-white/5">
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </Button>

                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                        <Lock size={12} /> Privacidade LGPD
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Política de <span className="text-yellow-500">Privacidade</span></h1>
                </header>

                <div className="prose prose-invert prose-yellow max-w-none space-y-8 uppercase tracking-wide text-xs font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">1. Coleta de Dados</h2>
                        <p>Coletamos apenas os dados estritamente necessários para o agendamento: Nome, Telefone e E-mail. Esses dados são utilizados exclusivamente para a comunicação entre a barbearia e o cliente.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">2. Segurança dos Dados</h2>
                        <p>Utilizamos criptografia de ponta e Row Level Security (RLS) para garantir que ninguém, além do dono da barbearia autorizada, tenha acesso aos dados dos clientes cadastrados.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">3. Compartilhamento</h2>
                        <p>Nós não vendemos ou compartilhamos seus dados com terceiros. Os dados de pagamento são processados de forma segura e externa pelo Mercado Pago, não sendo armazenados em nossos servidores.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">4. Seus Direitos (LGPD)</h2>
                        <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar a exclusão total de seus dados de nossa base a qualquer momento, diretamente através do painel de administração ou suporte.</p>
                    </section>
                </div>

                <footer className="pt-20 border-t border-white/5 text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">
                    BeautyFlow • Protegendo seus dados com excelência.
                </footer>
            </div>
        </div>
    );
};
