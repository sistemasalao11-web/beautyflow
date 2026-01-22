import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Shield } from 'lucide-react';

export const TermsOfUse = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-300 font-sans p-6 md:p-20">
            <div className="max-w-4xl mx-auto space-y-12">
                <Button variant="secondary" onClick={() => navigate(-1)} className="!bg-zinc-900 border-white/5">
                    <ArrowLeft size={16} className="mr-2" /> Voltar
                </Button>

                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                        <Shield size={12} /> Proteção Legal
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Termos de <span className="text-yellow-500">Uso</span></h1>
                </header>

                <div className="prose prose-invert prose-yellow max-w-none space-y-8 uppercase tracking-wide text-xs font-medium leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">1. Propriedade Intelectual (Copyright)</h2>
                        <p>O BeautyFlow é um software proprietário. Todo o código-fonte, design, logotipos, animações e fluxos de trabalho são protegidos por leis de direitos autorais. A reprodução, engenharia reversa ou distribuição não autorizada deste sistema resultará em medidas judiciais cabíveis.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">2. Uso do Serviço</h2>
                        <p>O usuário concorda em utilizar a plataforma apenas para fins lícitos de gestão de barbearias e agendamentos. É proibido o uso do sistema para spam, atividades fraudulentas ou qualquer prática que viole a lei brasileira.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">3. Assinatura e Cancelamento</h2>
                        <p>Os planos são cobrados mensalmente via Mercado Pago. O cancelamento pode ser solicitado a qualquer momento, interrompendo a cobrança para o próximo ciclo, porém sem reembolso de períodos já utilizados.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-black text-white">4. Limitação de Responsabilidade</h2>
                        <p>O BeautyFlow não se responsabiliza por perdas financeiras decorrentes de agendamentos não comparecidos ou falhas de internet do usuário. O sistema é fornecido "como está", buscando sempre a máxima estabilidade.</p>
                    </section>
                </div>

                <footer className="pt-20 border-t border-white/5 text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">
                    Última atualização: Janeiro de 2026 • BeautyFlow &copy; Todos os direitos reservados.
                </footer>
            </div>
        </div>
    );
};
