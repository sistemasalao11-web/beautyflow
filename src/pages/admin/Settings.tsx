import { useState, useEffect } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Save,
    CheckCircle,
    CheckCircle2,
    Trophy,
    Gem,
    Smartphone,
    Building2,
    MapPin,
    Palette,
    Layout,
    Clock,
    ExternalLink,
    Copy
} from 'lucide-react';


export const Settings = () => {
    const { settings, actions, loading } = useSaaS();
    const { previewTheme } = useTheme();
    const [formData, setFormData] = useState<any>(null);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/reserva/${settings?.slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };


    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        try {
            await actions.updateSettings({
                ...formData,
                whatsapp: formData.whatsapp.replace(/\D/g, '')
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to update settings:', err);
        }
    };

    if (loading || !formData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Configurações</h1>
                    <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">Identidade e regras do negócio</p>
                </div>
                {saved && (
                    <div className="flex items-center gap-2 text-emerald-500 animate-fade-in mb-2 bg-emerald-500/10 px-4 py-2 border border-emerald-500/20">
                        <CheckCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configurações Atualizadas</span>
                    </div>
                )}
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Salon Identity */}
                    <Card className="border-white/5 bg-zinc-900/40 p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <Building2 size={20} className="text-yellow-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identidade</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Nome Comercial</label>
                                <input
                                    type="text"
                                    value={formData.salonName}
                                    onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                                    className="input-premium"
                                    placeholder="Ex: Barber Shop Premium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Endereço Completo</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="input-premium pl-12"
                                        placeholder="Rua, Número, Bairro, Cidade"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Branding & Visuals (Real Theme) */}
                    <Card className="border-white/5 bg-zinc-900/40 p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <Palette size={20} className="text-yellow-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Aparência do SaaS</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block text-center">Cor Principal</label>
                                <div className="flex flex-col gap-4 items-center">
                                    <div
                                        className="w-full h-20 border-2 border-zinc-800 p-1 group relative overflow-hidden"
                                        style={{ backgroundColor: formData.themeColor }}
                                    >
                                        <input
                                            type="color"
                                            value={formData.themeColor}
                                            onChange={(e) => {
                                                const newColor = e.target.value;
                                                setFormData({ ...formData, themeColor: newColor });
                                                previewTheme(newColor);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-zinc-600">{formData.themeColor}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block text-center">Cor Secundária</label>
                                <div className="flex flex-col gap-4 items-center">
                                    <div
                                        className="w-full h-20 border-2 border-zinc-800 p-1 relative overflow-hidden"
                                        style={{ backgroundColor: formData.themeSecondaryColor }}
                                    >
                                        <input
                                            type="color"
                                            value={formData.themeSecondaryColor}
                                            onChange={(e) => setFormData({ ...formData, themeSecondaryColor: e.target.value })}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-zinc-600">{formData.themeSecondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Operating Hours Editor */}
                    <Card className="lg:col-span-2 border-white/5 bg-zinc-900/40 p-10">
                        <div className="flex items-center gap-4 mb-10 text-yellow-500">
                            <Clock size={20} />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Horário de Atendimento</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => {
                                const hour = formData.operatingHours.find((h: any) => h.day === idx);
                                if (!hour) return null;

                                return (
                                    <div key={idx} className={`p-6 border ${hour.active ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : 'border-white/5 bg-zinc-950/20 grayscale'} space-y-4 transition-all uppercase`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-black text-white tracking-widest">{dayName}</span>
                                            <input
                                                type="checkbox"
                                                checked={hour.active}
                                                onChange={(e) => {
                                                    const newHours = formData.operatingHours.map((h: any) =>
                                                        h.day === idx ? { ...h, active: e.target.checked } : h
                                                    );
                                                    setFormData({ ...formData, operatingHours: newHours });
                                                }}
                                                className="w-4 h-4 accent-yellow-500"
                                            />
                                        </div>
                                        {hour.active && (
                                            <div className="flex gap-2">
                                                <input
                                                    type="time"
                                                    value={hour.open}
                                                    onChange={(e) => {
                                                        const newHours = formData.operatingHours.map((h: any) =>
                                                            h.day === idx ? { ...h, open: e.target.value } : h
                                                        );
                                                        setFormData({ ...formData, operatingHours: newHours });
                                                    }}
                                                    className="bg-black border border-white/10 text-[10px] text-white p-2 w-full focus:border-yellow-500 outline-none"
                                                />
                                                <input
                                                    type="time"
                                                    value={hour.close}
                                                    onChange={(e) => {
                                                        const newHours = formData.operatingHours.map((h: any) =>
                                                            h.day === idx ? { ...h, close: e.target.value } : h
                                                        );
                                                        setFormData({ ...formData, operatingHours: newHours });
                                                    }}
                                                    className="bg-black border border-white/10 text-[10px] text-white p-2 w-full focus:border-yellow-500 outline-none"
                                                />
                                            </div>
                                        )}
                                        {!hour.active && (
                                            <div className="h-9 flex items-center justify-center text-[10px] font-black text-zinc-700">FECHADO</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Fidelity Rules */}
                    <Card className="lg:col-span-2 border-white/5 bg-zinc-900/40 p-10">
                        <div className="flex items-center gap-4 mb-10 text-yellow-500">
                            <Trophy size={20} />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Regras de Fidelidade</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">Modo de Acúmulo</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, fidelityRules: { ...formData.fidelityRules, type: 'value' } })}
                                        className={`p-6 border text-center transition-all ${formData.fidelityRules?.type === 'value' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-zinc-950/20'}`}
                                    >
                                        <div className="text-sm font-black text-white uppercase mb-1">Por Valor</div>
                                        <div className="text-[9px] text-zinc-500 uppercase font-black">R$ 1,00 = X Pontos</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, fidelityRules: { ...formData.fidelityRules, type: 'visit' } })}
                                        className={`p-6 border text-center transition-all ${formData.fidelityRules?.type === 'visit' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-zinc-950/20'}`}
                                    >
                                        <div className="text-sm font-black text-white uppercase mb-1">Por Visita</div>
                                        <div className="text-[9px] text-zinc-500 uppercase font-black">1 Corte = X Pontos</div>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">Pontos por {formData.fidelityRules?.type === 'value' ? 'Real (R$)' : 'Visita'}</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={formData.fidelityRules?.pointsPerUnit}
                                        onChange={(e) => setFormData({ ...formData, fidelityRules: { ...formData.fidelityRules, pointsPerUnit: Number(e.target.value) } })}
                                        className="input-premium flex-1 !text-2xl text-yellow-500 font-black"
                                    />
                                    <div className="text-zinc-500 font-black uppercase text-xs tracking-widest">PTS</div>
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase leading-relaxed">
                                    Configure quanto vale cada {formData.fidelityRules?.type === 'value' ? 'real gasto' : 'atendimento'} para seus clientes acumularem prêmios.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Public Booking Link */}
                    <Card className="lg:col-span-2 border-yellow-500/20 bg-yellow-500/[0.03] p-10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ExternalLink size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Seu Link de Agendamento</h3>
                                    <p className="text-[10px] text-yellow-500/60 font-black uppercase tracking-widest mt-1">Este é o link que você deve colocar na bio do Instagram</p>
                                </div>
                                <div className="flex items-center gap-3 bg-black/60 p-4 border border-white/5 font-mono text-[9px] text-zinc-400 select-all overflow-hidden text-ellipsis whitespace-nowrap">
                                    <span className="hidden sm:inline">{baseUrl}/reserva/</span>
                                    <span className="text-yellow-500 font-bold">{formData.slug}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={copyToClipboard}
                                    className={`!px-8 !py-6 ${copied ? '!bg-emerald-500' : '!bg-zinc-800'} !text-white flex items-center gap-3`}
                                >
                                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                    <span className="text-xs font-black uppercase tracking-widest">{copied ? 'Copiado!' : 'Copiar Link'}</span>
                                </Button>
                                <Button
                                    onClick={() => window.open(publicUrl, '_blank')}
                                    variant="secondary"
                                    className="!px-8 !py-6 !border-white/10 flex items-center gap-3"
                                >
                                    <ExternalLink size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">Abrir Página</span>
                                </Button>
                            </div>
                        </div>
                    </Card>


                    {/* SaaS Plan & Gamification */}
                    <Card className="p-0 overflow-hidden border-yellow-500/20">
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-transparent flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <Trophy size={20} className="text-yellow-500" /> Plano & Conquistas
                                </h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-1">Sua performance rende descontos</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-3xl font-black text-yellow-500 tracking-tighter">-{settings?.saasDiscount || 0}%</span>
                                <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Desconto Atual</span>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest">Como funciona?</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Nós valorizamos seu crescimento! A cada <b className="text-white">20 cortes</b> realizados,
                                        você ganha automaticamente <b className="text-yellow-500">+3% de desconto</b> na sua
                                        próxima mensalidade do software.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                                    <CheckCircle2 size={12} className="text-emerald-500" /> Sistema Ativo
                                </div>
                            </div>
                            <div className="bg-zinc-950/50 p-6 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Gem size={80} />
                                </div>
                                <div className="relative z-10">
                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Próxima Conquista</span>
                                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-yellow-500 h-full w-[65%] animate-pulse"></div>
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] font-black text-zinc-300">
                                        <span>Total Cortes</span>
                                        <span>Continuar Avançando</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* WhatsApp & Automation */}
                    <Card className="lg:col-span-2 border-white/5 bg-zinc-900/40 p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <Smartphone size={20} className="text-yellow-500" />
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Comunicação</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">WhatsApp Oficial</label>
                                    <input
                                        type="text"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                        className="input-premium"
                                        placeholder="5511999999999"
                                        required
                                    />
                                </div>
                                <div className="p-6 bg-zinc-950/50 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Layout size={14} className="text-yellow-500" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Logo (URL)</span>
                                    </div>
                                    <input
                                        type="url"
                                        value={formData.logoUrl}
                                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                        className="input-premium !py-2 !text-[10px]"
                                        placeholder="https://sua-logo.com/img.png"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Template de Mensagem</label>
                                <textarea
                                    value={formData.messageTemplate}
                                    onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                                    className="input-premium min-h-[140px] resize-none py-4"
                                    placeholder="Olá! Quero agendar..."
                                    required
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['{{service}}', '{{date}}', '{{time}}', '{{barber}}'].map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-zinc-950 text-[8px] text-yellow-500 font-black border border-white/5 uppercase tracking-tighter">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="flex justify-end pt-12 border-t border-white/5">
                    <Button type="submit" className="md:w-96 !bg-yellow-500 !text-black !py-10 shadow-[0_20px_50px_rgba(217,119,6,0.1)]">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3">
                                <Save size={20} className="mb-0.5" />
                                <span className="text-xl font-black uppercase tracking-tighter">Salvar Tudo</span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">Sincronização Ativa</span>
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
};
