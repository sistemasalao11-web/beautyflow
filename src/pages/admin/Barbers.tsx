import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaaS } from '../../hooks/useSaaS';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    UserPlus,
    Trash2,
    Users,
    Mail,
    Phone,
    Calendar,
    Save,
    X,
    Shield,
    Camera,
    Info,
    Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Barbers = () => {
    const { professionals, services, actions, loading, permissions } = useSaaS();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        bio: '',
        avatarUrl: '',
        servicesIds: [] as string[]
    });

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        try {
            const payload = {
                ...formData,
                servicesIds: formData.servicesIds || [],
                schedule: []
            };

            if (selectedId) {
                await actions.updateProfessional(selectedId, payload);
            } else {
                await actions.addProfessional(payload);
            }

            setFormData({ name: '', email: '', phone: '', role: '', bio: '', avatarUrl: '', servicesIds: [] });
            setIsAdding(false);
            setSelectedId(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Equipe</h1>
                    <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">Gestão de mestres e especialistas</p>
                </div>

                <Button
                    onClick={() => {
                        if (professionals.length >= permissions.maxProfessionals) {
                            toast.error(`Limite de ${permissions.maxProfessionals} profissionais atingido no plano ${permissions.plan.toUpperCase()}`);
                            return;
                        }
                        setSelectedId(null);
                        setFormData({ name: '', email: '', phone: '', role: '', bio: '', avatarUrl: '', servicesIds: [] });
                        setIsAdding(true);
                    }}
                    className={`!bg-yellow-500 group ${professionals.length >= permissions.maxProfessionals ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <UserPlus size={16} className="group-hover:rotate-12 transition-transform" /> Novo Profissional
                </Button>
            </header>

            {isAdding && (
                <Card className="animate-slide-up border-yellow-500/30 bg-yellow-500/[0.02] p-10">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                <Briefcase size={20} />
                            </div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                                {selectedId ? 'Editar Especialista' : 'Cadastrar Especialista'}
                            </h2>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="NOME DO BARBEIRO"
                                        className="input-premium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="contato@exemplo.com"
                                        className="input-premium"
                                    />
                                </div>
                            </div>

                            {/* Contact & Role */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        className="input-premium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Cargo / Especialidade</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="input-premium appearance-none"
                                        required
                                    >
                                        <option value="">SELECIONE CARGO</option>
                                        <option value="Barbeiro Master">BARBEIRO MASTER</option>
                                        <option value="Barbeiro Junior">BARBEIRO JUNIOR</option>
                                        <option value="Cabeleireiro">CABELEIREIRO</option>
                                        <option value="Manicure">MANICURE</option>
                                        <option value="Esteticista">ESTETICISTA</option>
                                    </select>
                                </div>
                            </div>

                            {/* Services Select */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Serviços que realiza</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[124px] overflow-y-auto pr-2">
                                        {services.map(s => (
                                            <label key={s.id} className={`p-4 border border-white/5 flex items-center gap-3 cursor-pointer transition-all ${formData.servicesIds.includes(s.id) ? 'bg-yellow-500/10 border-yellow-500' : 'bg-zinc-900/40 hover:bg-zinc-900'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={formData.servicesIds.includes(s.id)}
                                                    onChange={(e) => {
                                                        const ids = e.target.checked
                                                            ? [...formData.servicesIds, s.id]
                                                            : formData.servicesIds.filter(id => id !== s.id);
                                                        setFormData({ ...formData, servicesIds: ids });
                                                    }}
                                                />
                                                <span className="text-[8px] font-black uppercase text-zinc-400">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Biografia / Resumo</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="CONTE UM POUCO SOBRE A EXPERIÊNCIA DO PROFISSIONAL..."
                                    className="input-premium h-[124px] resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <Button type="submit" className="md:w-64 !bg-yellow-500 font-black uppercase tracking-widest text-[10px]">
                                <Save size={16} className="mr-2" /> {selectedId ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {professionals.length === 0 ? (
                    <div className="col-span-full py-40 text-center border-2 border-dashed border-zinc-900/50 rounded-none bg-zinc-900/10">
                        <Users size={48} className="mx-auto text-zinc-800 mb-6" />
                        <p className="text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-black">Nenhum profissional na equipe</p>
                    </div>
                ) : (
                    professionals.map((prof) => (
                        <Card key={prof.id} className="group hover:border-yellow-500/30 transition-all border-white/5 bg-zinc-900/40 p-0 overflow-hidden relative">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-zinc-950 flex items-center justify-center border-2 border-zinc-800 text-yellow-500 font-black text-4xl group-hover:border-yellow-500 transition-colors relative overflow-hidden">
                                            {prof.avatarUrl ? (
                                                <img src={prof.avatarUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                prof.name.charAt(0).toUpperCase()
                                            )}
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 p-1.5 bg-yellow-500 text-black border-4 border-zinc-900">
                                            <Shield size={12} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => actions.removeProfessional(prof.id)}
                                            className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="min-w-0">
                                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-1 break-words">
                                            {prof.name}
                                        </h3>
                                        <span className="text-[9px] text-yellow-500 uppercase tracking-widest font-black block">
                                            {prof.role || 'ESPECIALISTA'}
                                        </span>
                                    </div>

                                    {prof.bio && (
                                        <div className="p-4 bg-zinc-950/50 border-l-2 border-yellow-500/30">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed tracking-wider italic">
                                                "{prof.bio}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 min-w-0">
                                        <div className="flex items-start gap-4 text-zinc-400 group/item">
                                            <div className="p-2 bg-zinc-950 text-yellow-500/50 border border-white/5 shrink-0">
                                                <Mail size={12} />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest uppercase break-all pt-1.5 leading-relaxed">
                                                {prof.email || 'SEM E-MAIL'}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-4 text-zinc-400 group/item">
                                            <div className="p-2 bg-zinc-950 text-yellow-500/50 border border-white/5 shrink-0">
                                                <Phone size={12} />
                                            </div>
                                            <span className="text-[10px] font-black tracking-widest uppercase break-all pt-1.5 leading-relaxed">
                                                {prof.phone || 'SEM TELEFONE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 border-t border-white/5 bg-zinc-950/20">
                                <button
                                    onClick={() => navigate('/admin/agenda')}
                                    className="py-5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-yellow-500 hover:bg-white/[0.02] transition-all border-r border-white/5 flex items-center justify-center gap-2"
                                >
                                    <Calendar size={13} /> Agenda
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedId(prof.id);
                                        setFormData({
                                            name: prof.name,
                                            email: prof.email || '',
                                            phone: prof.phone || '',
                                            role: prof.role || '',
                                            bio: prof.bio || '',
                                            avatarUrl: prof.avatarUrl || '',
                                            servicesIds: prof.servicesIds || []
                                        });
                                        setIsAdding(true);
                                    }}
                                    className="py-5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-yellow-500 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2"
                                >
                                    <Info size={13} /> Detalhes / Editar
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
