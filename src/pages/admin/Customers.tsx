import { useState } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Search,
    Plus,
    Phone,
    Mail,
    TrendingUp,
    Award,
    StickyNote,
    X,
    Save,
    Trash2,
    Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Customers = () => {
    const { clients, appointments, actions, loading } = useSaaS();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any>(null);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const clientData = {
            name: formData.get('nome') as string,
            phone: formData.get('telefone') as string,
            email: formData.get('email') as string,
            technicalNotes: formData.get('notas_tecnicas') as string,
        };

        if (!clientData.name) return;

        if (selectedClient?.id) {
            await actions.updateClient(selectedClient.id, clientData);
        } else {
            await actions.addClient(clientData);
        }
        setIsModalOpen(false);
        setSelectedClient(null);
    };

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                        Gestão de <span className="text-yellow-500">Clientes</span>
                    </h1>
                    <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Base de dados e inteligência de fidelização</p>
                </div>
                <Button
                    onClick={() => { setSelectedClient(null); setIsModalOpen(true); }}
                    className="!bg-yellow-500 !text-black flex items-center gap-2 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    Novo Cliente
                </Button>
            </header>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-yellow-500 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="BUSCAR POR NOME OU TELEFONE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-white/5 py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest focus:border-yellow-500/50 focus:bg-zinc-900 transition-all outline-none"
                />
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <Card
                        key={client.id}
                        className="border-white/5 bg-zinc-900/60 p-8 space-y-8 hover:border-yellow-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-zinc-950 border border-white/5 flex items-center justify-center text-yellow-500 text-xl font-black">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider leading-none mb-1">{client.name}</h3>
                                    <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                        <Calendar size={10} className="text-yellow-500" />
                                        Cliente desde {format(new Date(client.createdAt), 'MMM yyyy', { locale: ptBR })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 bg-zinc-950/50 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none">
                                    <TrendingUp size={10} className="text-emerald-500" /> Gasto
                                </div>
                                <div className="text-xs font-black text-white leading-none">R$ {client.totalSpent.toFixed(2)}</div>
                            </div>
                            <div className="p-3 bg-zinc-950/50 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none">
                                    <Award size={10} className="text-yellow-500" /> Pontos
                                </div>
                                <div className="text-xs font-black text-white leading-none">{client.fidelityPoints} pts</div>
                            </div>
                            <div className="p-3 bg-zinc-950/50 border border-white/5 space-y-1">
                                <div className="flex items-center gap-1.5 text-[8px] text-zinc-600 font-black uppercase tracking-widest leading-none">
                                    <Plus size={10} className="text-sky-500" /> Cortes
                                </div>
                                <div className="text-xs font-black text-white leading-none">{appointments.filter(a => a.clientId === client.id && a.status === 'completed').length}</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {client.phone && (
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Phone size={14} className="text-yellow-500" /> {client.phone}
                                </div>
                            )}
                            {client.email && (
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <Mail size={14} className="text-yellow-500" /> {client.email}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-white/5 flex flex-wrap gap-2">
                            <button
                                onClick={() => navigate('/admin/agenda', { state: { clientId: client.id, clientName: client.name } })}
                                className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-500 text-[9px] font-black uppercase tracking-widest text-black transition-all flex items-center justify-center gap-2"
                            >
                                <Calendar size={14} /> Agendar
                            </button>
                            <button
                                onClick={() => { setSelectedClient(client); setIsModalOpen(true); }}
                                className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                            >
                                Perfil
                            </button>
                            <button
                                onClick={() => actions.removeClient(client.id)}
                                className="p-3 bg-zinc-950 hover:bg-red-500/10 border border-white/5 text-zinc-600 hover:text-red-500 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <Card className="w-full max-w-2xl bg-zinc-950 border-white/10 overflow-hidden animate-slide-up">
                        <header className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
                                </h2>
                                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Registro oficial no CRM</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 text-zinc-500 transition-colors">
                                <X size={24} />
                            </button>
                        </header>

                        {selectedClient && (
                            <div className="px-8 py-4 bg-zinc-900/20 border-b border-white/5 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Gasto Total</p>
                                    <p className="text-sm font-black text-white leading-none">R$ {selectedClient.totalSpent.toFixed(2)}</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <p className="text-[8px] text-yellow-500 font-black uppercase tracking-widest mb-1">Pontos Fidelidade</p>
                                    <p className="text-sm font-black text-yellow-500 leading-none">{selectedClient.fidelityPoints} PTS</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] text-sky-500 font-black uppercase tracking-widest mb-1">Total Cortes</p>
                                    <p className="text-sm font-black text-white leading-none">
                                        {appointments.filter(a => a.clientId === selectedClient.id && a.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        name="nome"
                                        defaultValue={selectedClient?.name}
                                        className="input-premium"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">Telefone (WhatsApp)</label>
                                    <input
                                        name="telefone"
                                        defaultValue={selectedClient?.phone}
                                        className="input-premium"
                                        placeholder="5511..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        defaultValue={selectedClient?.email}
                                        className="input-premium"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <StickyNote size={12} className="text-yellow-500" />
                                        <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Notas Técnicas / Observações</label>
                                    </div>
                                    <textarea
                                        name="notas_tecnicas"
                                        defaultValue={selectedClient?.technicalNotes}
                                        className="input-premium min-h-[120px] resize-none py-4"
                                        placeholder="Ex: Prefere degradê navalhado, utiliza pomada matte..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="w-full md:w-auto !py-8 !px-16 !bg-yellow-500 !text-black flex items-center gap-3">
                                    <Save size={18} />
                                    <span className="text-sm font-black uppercase tracking-widest">Salvar Registro</span>
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};
