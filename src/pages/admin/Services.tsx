import { useState } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Scissors,
    Plus,
    Clock,
    Trash2,
    Save,
    X,
    Pencil
} from 'lucide-react';

export const Services = () => {
    const { services, categories, actions, loading } = useSaaS();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        duration: '30',
        description: '',
        categoryId: '',
        isPackage: false,
        packageItems: [] as string[]
    });

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
    );

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newService,
                price: Number(newService.price),
                duration: Number(newService.duration)
            };

            if (selectedId) {
                await actions.updateService(selectedId, payload);
            } else {
                await actions.addService(payload);
            }

            setIsAdding(false);
            setNewService({ name: '', price: '', duration: '30', description: '', categoryId: '', isPackage: false, packageItems: [] });
            setSelectedId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Excluir este serviço?')) {
            await actions.removeService(id);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Serviços</h1>
                    <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">Catálogo de especialidades do seu salão</p>
                </div>

                <Button onClick={() => {
                    setSelectedId(null);
                    setNewService({ name: '', price: '', duration: '30', description: '', categoryId: '', isPackage: false, packageItems: [] });
                    setIsAdding(true);
                }} className="!bg-yellow-500">
                    <Plus size={16} /> Novo Serviço
                </Button>
            </header>

            {isAdding && (
                <Card className="animate-slide-up border-yellow-500/30 bg-yellow-500/[0.02] p-8">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{selectedId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                        <button onClick={() => setIsAdding(false)} className="text-zinc-600 hover:text-white"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Título do Serviço</label>
                            <input
                                placeholder="EX: CORTE DEGRADÊ"
                                className="input-premium"
                                value={newService.name}
                                onChange={e => setNewService({ ...newService, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Preço (R$)</label>
                            <input
                                placeholder="0,00"
                                type="number"
                                step="0.01"
                                className="input-premium"
                                value={newService.price}
                                onChange={e => setNewService({ ...newService, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Duração (Min)</label>
                            <select
                                className="input-premium appearance-none"
                                value={newService.duration}
                                onChange={e => setNewService({ ...newService, duration: e.target.value })}
                            >
                                <option value="15">15 MINUTOS</option>
                                <option value="30">30 MINUTOS</option>
                                <option value="45">45 MINUTOS</option>
                                <option value="60">1 HORA</option>
                                <option value="90">1H 30MIN</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Descrição Curta</label>
                            <input
                                placeholder="BREVE DESCRIÇÃO DO SERVIÇO..."
                                className="input-premium"
                                value={newService.description}
                                onChange={e => setNewService({ ...newService, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1">Categoria (Opcional)</label>
                            <select
                                className="input-premium appearance-none"
                                value={newService.categoryId}
                                onChange={e => setNewService({ ...newService, categoryId: e.target.value })}
                            >
                                <option value="">SEM CATEGORIA</option>
                                {categories.filter(c => c.type === 'service').map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        {/* Package Toggle */}
                        <div className="md:col-span-3 h-px bg-white/5 my-4"></div>

                        <div className="md:col-span-3 space-y-4">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setNewService({ ...newService, isPackage: !newService.isPackage })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${newService.isPackage ? 'bg-yellow-500' : 'bg-zinc-800'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newService.isPackage ? 'left-7' : 'left-1'}`} />
                                </button>
                                <label className="text-xs font-black text-white uppercase tracking-widest">Este serviço é um PACOTE (Combo)?</label>
                            </div>

                            {newService.isPackage && (
                                <div className="p-6 bg-zinc-900/50 border border-yellow-500/20 rounded-xl space-y-6 animate-fade-in">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Selecione os serviços que compõem este combo:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {services.filter(s => !s.isPackage).map(s => {
                                            const isSelected = newService.packageItems.includes(s.id);
                                            return (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const items = isSelected
                                                            ? newService.packageItems.filter(id => id !== s.id)
                                                            : [...newService.packageItems, s.id];

                                                        // Auto-calculate suggested values
                                                        const selectedServices = services.filter(ser => items.includes(ser.id));
                                                        const totalDuration = selectedServices.reduce((sum, ser) => sum + ser.duration, 0);
                                                        const totalPrice = selectedServices.reduce((sum, ser) => sum + ser.price, 0);

                                                        setNewService({
                                                            ...newService,
                                                            packageItems: items,
                                                            duration: String(totalDuration),
                                                            price: newService.price || String(totalPrice) // Only suggest price if empty
                                                        });
                                                    }}
                                                    className={`p-3 rounded-lg border text-left transition-all flex justify-between items-center ${isSelected
                                                        ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                                        : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/10'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-wide">{s.name}</span>
                                                    {isSelected && <Plus size={12} className="rotate-45" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-4 bg-zinc-950/50 rounded-lg border border-white/5">
                                            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Duração Total Sugerida</p>
                                            <p className="text-sm font-black text-white">{newService.duration} min</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-zinc-950/50 rounded-lg border border-white/5">
                                            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Soma dos Preços Individuais</p>
                                            <p className="text-sm font-black text-yellow-500">
                                                R$ {services.filter(s => newService.packageItems.includes(s.id)).reduce((sum, s) => sum + s.price, 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" className="w-full h-[52px] !bg-yellow-500 font-black uppercase tracking-[0.2em] text-[10px]">
                                <Save size={16} className="mr-2" /> {selectedId ? 'Salvar Alterações' : 'Salvar Serviço'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <Card key={service.id} className="group hover:bg-zinc-900/60 transition-all border-white/5 bg-zinc-900/40 p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-zinc-950/50 border border-white/5 rounded-lg text-yellow-500">
                                <Scissors size={20} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setSelectedId(service.id);
                                        setNewService({
                                            name: service.name,
                                            price: String(service.price),
                                            duration: String(service.duration),
                                            description: service.description || '',
                                            categoryId: service.categoryId || '',
                                            isPackage: !!service.isPackage,
                                            packageItems: service.packageItems || []
                                        });
                                        setIsAdding(true);
                                    }}
                                    className="p-2 text-zinc-600 hover:text-white transition-colors"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{service.name}</h3>
                                    {service.isPackage && (
                                        <span className="text-[7px] bg-yellow-500 text-black px-1.5 py-0.5 font-black tracking-widest uppercase rounded-sm">COMBO</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-2">
                                    <span className="text-[8px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 font-black tracking-widest uppercase">
                                        {service.categoryName || 'Geral'}
                                    </span>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide leading-relaxed">{service.description || 'Sem descrição'}</p>
                                </div>
                                {service.isPackage && service.packageItems && service.packageItems.length > 0 && (
                                    <div className="mt-4 p-3 bg-zinc-950/30 rounded border border-white/5">
                                        <p className="text-[7px] text-zinc-600 font-black uppercase tracking-widest mb-2 italic">Serviços Inclusos:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {service.packageItems.map(itemId => {
                                                const subService = services.find(s => s.id === itemId);
                                                return (
                                                    <span key={itemId} className="text-[8px] text-zinc-400 border border-white/5 px-2 py-0.5 rounded-full uppercase">
                                                        {subService?.name || 'Serviço Removido'}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-white/5 w-full"></div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{service.duration} min</span>
                                </div>
                                <div className="text-xl font-black text-yellow-500">
                                    R$ {service.price.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {services.length === 0 && (
                <div className="py-40 text-center border-2 border-dashed border-zinc-900/50 rounded-3xl">
                    <Scissors size={40} className="mx-auto text-zinc-800 mb-4" />
                    <p className="text-zinc-600 uppercase text-[10px] font-bold tracking-[0.3em]">Nenhum serviço cadastrado ainda</p>
                </div>
            )}
        </div>
    );
};
