import { useState } from 'react';
import type { Service } from '../types/service';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface ServiceListProps {
    services: Service[];
    onRemove: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Service>) => void;
}

export const ServiceList = ({ services, onRemove, onUpdate }: ServiceListProps) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');

    const handleEdit = (service: Service) => {
        setEditingId(service.id);
        setEditName(service.name);
        setEditPrice(service.price.toString());
    };

    const handleSave = () => {
        if (editingId) {
            onUpdate(editingId, {
                name: editName,
                price: parseFloat(editPrice) || 0
            });
            setEditingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900">
                    <p className="text-zinc-600 uppercase tracking-widest text-xs">Nenhum serviço cadastrado</p>
                </div>
            ) : (
                services.map((service) => (
                    <Card key={service.id} className="group !p-8 flex flex-col justify-between shimmer-effect">
                        {editingId === service.id ? (
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Nome do Serviço</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="input-premium !p-2 text-sm"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">Preço (R$)</label>
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="input-premium !p-2 text-sm"
                                        />
                                    </div>
                                    <Button onClick={handleSave} className="!px-4 !py-3 h-[42px]"><Check size={16} /></Button>
                                    <Button onClick={() => setEditingId(null)} variant="secondary" className="!px-4 !py-3 h-[42px]"><X size={16} /></Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight mb-1 group-hover:text-yellow-500 transition-colors uppercase">{service.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="h-px w-4 bg-yellow-500"></span>
                                            <span className="text-yellow-500 font-black text-2xl tracking-tighter">R$ {service.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => handleEdit(service)} className="p-2 text-zinc-600 hover:text-yellow-500 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onRemove(service.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-[0.3em] font-bold">Specialized Service</span>
                                    <div className="w-1.5 h-1.5 bg-yellow-500 rotate-45"></div>
                                </div>
                            </>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
};
