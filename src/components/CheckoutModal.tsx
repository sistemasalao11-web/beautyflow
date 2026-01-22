import { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { SAAS_CONFIG } from '../config/saas';
import {
    X,
    Check,
    CreditCard,
    QrCode,
    ShieldCheck,
    Loader2,
    Lock,
    Zap
} from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        id: 'iniciante' | 'profissional' | 'elite';
        name: string;
        price: string;
        features: string[];
    } | null;
}

export const CheckoutModal = ({ isOpen, onClose, plan }: CheckoutModalProps) => {
    const [method, setMethod] = useState<'pix' | 'card' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ discountLabel: string; links: any } | null>(null);
    const [couponError, setCouponError] = useState('');

    if (!isOpen || !plan) return null;

    const handlePayment = () => {
        setIsProcessing(true);

        if (method === 'card') {
            const config = SAAS_CONFIG as any;
            const paymentUrl = appliedCoupon
                ? appliedCoupon.links[plan.id]
                : config.paymentLinks[plan.id];

            // Simula um pequeno delay de processamento antes de redirecionar para o gateway real
            setTimeout(() => {
                window.location.href = paymentUrl;
            }, 1500);
            return;
        }

        // Simulação de processamento de PIX
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
        }, 2500);
    };

    const handleApplyCoupon = () => {
        const config = SAAS_CONFIG as any;
        const coupon = config.coupons?.[couponInput.toUpperCase()];
        if (coupon) {
            setAppliedCoupon(coupon);
            setCouponError('');
        } else {
            setAppliedCoupon(null);
            setCouponError('Cupom inválido ou expirado');
        }
    };

    const resetAndClose = () => {
        setMethod(null);
        setIsSuccess(false);
        setIsProcessing(false);
        setCouponInput('');
        setAppliedCoupon(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={resetAndClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-xl animate-slide-up">
                <Card className="!p-0 overflow-hidden border-white/5 bg-zinc-950 overflow-y-auto max-h-[90vh]">

                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center text-black">
                                <Zap size={18} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter text-white">Finalizar Assinatura</h2>
                        </div>
                        <button
                            onClick={resetAndClose}
                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {!isSuccess ? (
                        <div className="p-8 space-y-8">
                            {/* Plan Summary */}
                            <div className="bg-zinc-900/50 p-6 border border-white/5">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest block mb-1">Plano Selecionado</span>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{plan.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white">R$ {plan.price}</span>
                                        <span className="text-[10px] text-zinc-500 font-bold uppercase block">Por Mês</span>
                                    </div>
                                </div>
                                <ul className="grid grid-cols-2 gap-2">
                                    {plan.features.slice(0, 4).map((f, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[9px] text-zinc-400 uppercase font-bold tracking-widest">
                                            <Check size={10} className="text-yellow-500" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Coupon Area */}
                            <div className="space-y-4">
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Possui um Cupom?</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        placeholder="CÓDIGO"
                                        className="input-premium flex-1 !py-3 !text-xs"
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        className="!py-3 !px-6 !text-[10px] !bg-zinc-800 hover:!bg-zinc-700"
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                                {appliedCoupon && (
                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-2 animate-fade-in">
                                        <Check size={12} /> {appliedCoupon.discountLabel}
                                    </div>
                                )}
                                {couponError && (
                                    <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest animate-fade-in">
                                        {couponError}
                                    </div>
                                )}
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 mb-4 animate-pulse">
                                    <p className="text-[9px] text-yellow-500 font-black uppercase tracking-widest text-center leading-relaxed">
                                        ⚠️ Importante: Após o pagamento bem-sucedido, aguarde o redirecionamento automático para criar sua conta administrativa.
                                    </p>
                                </div>
                                <label className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] ml-1">Forma de Pagamento</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        disabled={isProcessing}
                                        onClick={() => setMethod('pix')}
                                        className={`p-6 border flex flex-col items-center gap-3 transition-all ${method === 'pix' ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500' : 'border-white/5 bg-zinc-900/40 hover:border-white/20'
                                            }`}
                                    >
                                        <QrCode size={32} className={method === 'pix' ? 'text-yellow-500' : 'text-zinc-600'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">PIX Instantâneo</span>
                                    </button>

                                    <button
                                        disabled={isProcessing}
                                        onClick={() => setMethod('card')}
                                        className={`p-6 border flex flex-col items-center gap-3 transition-all ${method === 'card' ? 'border-yellow-500 bg-yellow-500/5 ring-1 ring-yellow-500' : 'border-white/5 bg-zinc-900/40 hover:border-white/20'
                                            }`}
                                    >
                                        <CreditCard size={32} className={method === 'card' ? 'text-yellow-500' : 'text-zinc-600'} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Cartão de Crédito</span>
                                    </button>
                                </div>
                            </div>

                            {/* PIX Specific Area */}
                            {method === 'pix' && !isProcessing && (
                                <div className="bg-zinc-900 p-6 border border-yellow-500/20 text-center space-y-4 animate-fade-in">
                                    <div className="w-32 h-32 bg-white mx-auto p-2">
                                        <div className="w-full h-full bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                                            <QrCode size={64} className="text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Aprovação imediata</p>
                                        <p className="text-xs text-white font-mono break-all selection:bg-yellow-500">00020126360014BR.GOV.BCB.PIX011400000000000000</p>
                                    </div>
                                    <Button className="w-full !py-3 !text-[10px] !bg-zinc-800 hover:!bg-zinc-700">Copiar Código PIX</Button>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="pt-4 space-y-4">
                                <Button
                                    onClick={handlePayment}
                                    disabled={!method || isProcessing}
                                    className="w-full !py-6 !text-lg !bg-yellow-500 shadow-[0_0_30px_rgba(217,119,6,0.15)] disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <><Loader2 size={24} className="animate-spin mr-2" /> Processando...</>
                                    ) : (
                                        <><ShieldCheck size={20} className="mr-2" /> Confirmar e Pagar</>
                                    )}
                                </Button>
                                <div className="flex items-center justify-center gap-2 text-zinc-600 uppercase tracking-widest text-[8px] font-black">
                                    <Lock size={10} /> Ambiente 100% Seguro &bull; SSL Encrypted
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Success State */
                        <div className="p-16 text-center space-y-8 animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/5">
                                <Check size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Pagamento Confirmado!</h3>
                                <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Seu acesso ao plano {plan.name} foi liberado.</p>
                            </div>
                            <Button onClick={resetAndClose} className="w-full !py-4">Ir para Dashboard</Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
