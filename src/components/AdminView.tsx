'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Tecnico } from '@/types';
import { Settings, Package, MapPin, Plus, Edit2, Trash2, X, Check, ArrowLeft, Search, Upload, ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'products' | 'tecnicos';

export default function AdminView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [isTecnicoModalOpen, setIsTecnicoModalOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Partial<Tecnico> | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [tecnicoSearch, setTecnicoSearch] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const compressImage = (file: File, maxWidth = 400, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Falha ao comprimir')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const fileName = `prod-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      setEditingProduct(prev => prev ? { ...prev, image_url: urlData.publicUrl } : prev);
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      alert('Erro ao fazer upload da imagem. Verifique se o bucket "product-images" existe no Supabase Storage.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, tecRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('tecnicos').select('*').order('nome')
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (tecRes.data) setTecnicos(tecRes.data);
    setLoading(false);
  };

  // --- Products Handlers ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      // Update
      await supabase.from('products').update(editingProduct).eq('id', editingProduct.id);
    } else {
      // Insert
      await supabase.from('products').insert([editingProduct]);
    }
    setIsProductModalOpen(false);
    fetchData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  // --- Tecnicos Handlers ---
  const handleSaveTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTecnico) return;

    if (editingTecnico.id) {
      // Update
      await supabase.from('tecnicos').update(editingTecnico).eq('id', editingTecnico.id);
    } else {
      // Insert
      await supabase.from('tecnicos').insert([editingTecnico]);
    }
    setIsTecnicoModalOpen(false);
    fetchData();
  };

  const handleDeleteTecnico = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este técnico?')) {
      await supabase.from('tecnicos').delete().eq('id', id);
      fetchData();
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredTecnicos = tecnicos.filter(t => 
    t.nome.toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.categoria || '').toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.tipo || '').toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.vendedor_parceiro || '').toLowerCase().includes(tecnicoSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-lg font-bold font-outfit">Painel Administrativo</h1>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tecnicos')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'tecnicos'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Técnicos
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* TAB PRODUTOS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Gestão de Produtos</h2>
                  <button
                    onClick={() => {
                      setEditingProduct({ is_active: true, commercial_rules: { allow_pix: true, allow_boleto: true, allow_card: true, allow_financing: true, max_boleto_installments: 3, max_card_installments: 12 } });
                      setIsProductModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar produtos por nome..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Nome</th>
                          <th className="px-4 py-3 font-semibold">Preço Base</th>
                          <th className="px-4 py-3 font-semibold">Mensalidade</th>
                          <th className="px-4 py-3 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium">{p.name}</td>
                            <td className="px-4 py-3 text-slate-500">R$ {p.default_price}</td>
                            <td className="px-4 py-3 text-slate-500">R$ {p.monthly_fee || 0}</td>
                            <td className="px-4 py-3 flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB TÉCNICOS */}
            {activeTab === 'tecnicos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Gestão de Técnicos (Mapa)</h2>
                  <button
                    onClick={() => {
                      setEditingTecnico({ lat: 0, lng: 0 });
                      setIsTecnicoModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Técnico
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar técnicos..." 
                    value={tecnicoSearch}
                    onChange={(e) => setTecnicoSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Nome</th>
                          <th className="px-4 py-3 font-semibold">Cidade/Cat</th>
                          <th className="px-4 py-3 font-semibold">Parceiro</th>
                          <th className="px-4 py-3 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredTecnicos.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium max-w-[200px] truncate" title={t.nome}>{t.nome}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {t.categoria} • {t.tipo}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{t.vendedor_parceiro || '-'}</td>
                            <td className="px-4 py-3 flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setEditingTecnico(t); setIsTecnicoModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTecnico(t.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL PRODUTO */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nome</label>
                  <input type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Descrição</label>
                  <textarea value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Preço Base (R$)</label>
                    <input type="number" step="0.01" value={editingProduct.default_price || ''} onChange={e => setEditingProduct({...editingProduct, default_price: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Mensalidade (R$)</label>
                    <input type="number" step="0.01" value={editingProduct.monthly_fee || ''} onChange={e => setEditingProduct({...editingProduct, monthly_fee: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2">Imagem do Produto</label>
                  <div className="space-y-3">
                    {/* Preview e Upload */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                        {editingProduct.image_url ? (
                          <img src={editingProduct.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm cursor-pointer transition-colors">
                          <Upload className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {uploadingImage ? 'Enviando...' : 'Fazer upload de imagem'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden" 
                          />
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                          A imagem será automaticamente redimensionada
                        </p>
                      </div>
                    </div>
                    
                    {/* Fallback Input */}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-medium mb-1">Ou cole um link direto:</label>
                      <input 
                        type="text" 
                        value={editingProduct.image_url || ''} 
                        onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} 
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" 
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                {/* Aqui poderíamos adicionar os checks de regras comerciais se necessário */}
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="productForm" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TECNICO */}
      {isTecnicoModalOpen && editingTecnico && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">{editingTecnico.id ? 'Editar Técnico' : 'Novo Técnico'}</h3>
              <button onClick={() => setIsTecnicoModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <form id="tecnicoForm" onSubmit={handleSaveTecnico} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nome Completo</label>
                  <input type="text" value={editingTecnico.nome || ''} onChange={e => setEditingTecnico({...editingTecnico, nome: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Categoria (ex: REDE PLUS)</label>
                    <input type="text" value={editingTecnico.categoria || ''} onChange={e => setEditingTecnico({...editingTecnico, categoria: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tipo (ex: Fixo, Volante)</label>
                    <input type="text" value={editingTecnico.tipo || ''} onChange={e => setEditingTecnico({...editingTecnico, tipo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Telefone</label>
                    <input type="text" value={editingTecnico.telefone || ''} onChange={e => setEditingTecnico({...editingTecnico, telefone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <input type="email" value={editingTecnico.email || ''} onChange={e => setEditingTecnico({...editingTecnico, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Latitude</label>
                    <input type="number" step="any" value={editingTecnico.lat || ''} onChange={e => setEditingTecnico({...editingTecnico, lat: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Longitude</label>
                    <input type="number" step="any" value={editingTecnico.lng || ''} onChange={e => setEditingTecnico({...editingTecnico, lng: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Vendedor Parceiro associado (opcional)</label>
                  <input type="text" value={editingTecnico.vendedor_parceiro || ''} onChange={e => setEditingTecnico({...editingTecnico, vendedor_parceiro: e.target.value})} placeholder="Nome do vendedor" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsTecnicoModalOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="tecnicoForm" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
