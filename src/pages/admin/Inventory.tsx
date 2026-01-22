import { useState } from 'react';
import { useSaaS } from '../../hooks/useSaaS';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Package,
    Plus,
    Search,
    AlertTriangle,
    Trash2,
    X,
    Save,
    Pencil
} from 'lucide-react';

export const Inventory = () => {
    const { products, categories, actions, loading } = useSaaS();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        stock: '',
        minStock: '5',
        description: '',
        categoryId: ''
    });

    if (loading) return (
        <div className="py-20 flex justify-center">
            <div className="h-8 w-8 border-2 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
        </div>
    );

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoryId && product.categoryId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalStockValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newProduct,
                price: Number(newProduct.price),
                stock: Number(newProduct.stock),
                minStock: Number(newProduct.minStock)
            };

            if (selectedId) {
                await actions.updateProduct(selectedId, payload);
            } else {
                await actions.addProduct(payload);
            }

            setIsAdding(false);
            setNewProduct({ name: '', price: '', stock: '', minStock: '5', description: '', categoryId: '' });
            setSelectedId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Deseja excluir este produto?')) {
            await actions.removeProduct(id);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Estoque</h1>
                    <p className="text-zinc-500 uppercase tracking-[0.2em] text-xs">Controle de produtos e suprimentos</p>
                </div>

                <div className="flex gap-4">
                    <Button onClick={() => {
                        setSelectedId(null);
                        setNewProduct({ name: '', price: '', stock: '', minStock: '5', description: '', categoryId: '' });
                        setIsAdding(true);
                    }} className="!bg-yellow-500">
                        <Plus size={16} /> Novo Produto
                    </Button>
                </div>
            </header>

            {isAdding && (
                <Card className="animate-slide-up border-yellow-500/30 bg-yellow-500/[0.02]">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">{selectedId ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
                        <button onClick={() => setIsAdding(false)} className="text-zinc-600 hover:text-white"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <input
                            placeholder="NOME DO PRODUTO"
                            className="input-premium"
                            value={newProduct.name}
                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            required
                        />
                        <input
                            placeholder="PREÇO (R$)"
                            type="number"
                            step="0.01"
                            className="input-premium"
                            value={newProduct.price}
                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                            required
                        />
                        <input
                            placeholder="ESTOQUE ATUAL"
                            type="number"
                            className="input-premium"
                            value={newProduct.stock}
                            onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                            required
                        />
                        <select
                            className="input-premium appearance-none"
                            value={newProduct.categoryId}
                            onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                        >
                            <option value="">SEM CATEGORIA</option>
                            {categories.filter(c => c.type === 'product').map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                            ))}
                        </select>
                        <Button type="submit" className="h-[48px] uppercase tracking-widest text-[10px] items-center justify-center">
                            <Save size={16} className="mr-2" /> {selectedId ? 'Salvar Alterações' : 'Salvar Produto'}
                        </Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col gap-2 relative overflow-hidden group border-white/5 bg-zinc-900/40">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={60} />
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total de Itens</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{products.length}</span>
                </Card>

                <Card className="flex flex-col gap-2 relative overflow-hidden group border-white/5 bg-zinc-900/40">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Package size={60} className="text-emerald-500" />
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Valor em Estoque</span>
                    <span className="text-4xl font-black text-white tracking-tighter">R$ {totalStockValue.toFixed(2)}</span>
                </Card>

                <Card className={`flex flex-col gap-2 relative overflow-hidden group border-l-4 ${lowStockCount > 0 ? 'border-l-red-600 bg-red-600/5' : 'border-l-emerald-600 bg-emerald-600/5'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={60} />
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Alertas de Reposição</span>
                    <span className={`text-4xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{lowStockCount}</span>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                    type="text"
                    placeholder="BUSCAR PRODUTO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/40 border border-white/5 py-6 pl-16 pr-6 text-white text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-500/50 transition-all rounded-xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <Card key={product.id} className="group hover:scale-[1.02] transition-all duration-300 border-white/5 bg-zinc-900/40 p-0 overflow-hidden">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{product.name}</h3>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{product.categoryName || 'Geral'}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setSelectedId(product.id);
                                            setNewProduct({
                                                name: product.name,
                                                price: String(product.price),
                                                stock: String(product.stock),
                                                minStock: String(product.minStock),
                                                description: product.description || '',
                                                categoryId: product.categoryId || ''
                                            });
                                            setIsAdding(true);
                                        }}
                                        className="p-2 text-zinc-600 hover:text-white"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-zinc-600 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-[9px] text-zinc-500 uppercase font-black">Preço de Venda</span>
                                    <div className="text-lg font-black text-yellow-500">R$ {product.price.toFixed(2)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-zinc-500 uppercase font-black">Disponível</span>
                                    <div className={`text-lg font-black ${product.stock <= product.minStock ? 'text-red-500' : 'text-white'}`}>
                                        {product.stock} un
                                    </div>
                                </div>
                            </div>
                        </div>
                        {product.stock <= product.minStock && (
                            <div className="bg-red-600/10 text-red-500 text-[8px] font-black uppercase tracking-widest py-2 text-center border-t border-red-500/20">
                                Reposição Necessária
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="py-40 text-center space-y-4">
                    <Package size={40} className="mx-auto text-zinc-800" />
                    <p className="text-zinc-600 uppercase text-[10px] font-bold tracking-widest">Nenhum produto em estoque</p>
                </div>
            )}
        </div>
    );
};
