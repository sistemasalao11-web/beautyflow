import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('beautyflow-cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('beautyflow-cookie-consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 left-8 right-8 z-[200] md:left-auto md:right-8 md:max-w-md animate-slide-up">
            <div className="bg-zinc-900 border-2 border-yellow-500/30 p-6 shadow-2xl space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 text-yellow-500">
                        <Cookie size={24} />
                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Privacidade & Cookies</h4>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
                    Utilizamos cookies para melhorar sua experiência e garantir a segurança do sistema. Ao continuar, você concorda com nossos <Link to="/termos" className="text-yellow-500 hover:underline">Termos de Uso</Link> e <Link to="/privacidade" className="text-yellow-500 hover:underline">Política de Privacidade</Link> sob as normas da LGPD.
                </p>

                <div className="flex justify-end pt-2">
                    <Button onClick={handleAccept} className="!bg-yellow-500 !py-3 !px-8 text-[10px] font-black uppercase tracking-[0.2em] !text-black">
                        Aceitar e Continuar
                    </Button>
                </div>
            </div>
        </div>
    );
};
