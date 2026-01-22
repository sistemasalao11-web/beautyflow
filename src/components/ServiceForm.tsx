import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Service } from '../types/saas';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';

interface Props {
    onAdd: (service: Omit<Service, 'id'>) => void;
}

export const ServiceForm = ({ onAdd }: Props) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !price) return;

        onAdd({
            name,
            price: parseFloat(price),
            duration: 30, // Default duration
            description: '',
            categoryId: '', // Service uses categoryId,
            salonId: '' // Satisfying type, hook will handle actual value
        });

        setName('');
        setPrice('');
    };

    return (
        <Card className="shimmer-effect">
            <div className="flex items-center gap-4 mb-10">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Novo Serviço</h2>
                <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-6 space-y-2">
                    <label htmlFor="name" className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Nome do Serviço</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Corte Degradê"
                        className="input-premium"
                        required
                    />
                </div>

                <div className="md:col-span-3 space-y-2">
                    <label htmlFor="price" className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] ml-1">Preço (R$)</label>
                    <input
                        id="price"
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="input-premium"
                        required
                    />
                </div>

                <div className="md:col-span-3">
                    <Button type="submit" className="w-full">
                        <Plus size={18} /> Adicionar
                    </Button>
                </div>
            </form>
        </Card>
    );
};
