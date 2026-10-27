'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Tecnico } from '@/types';
import { Settings, Package, MapPin, Plus, Edit2, Trash2, X, Check, ArrowLeft, Search, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { QuoteDialog } from './QuoteControls';
import { usePendingAction } from '@/lib/usePendingAction';
import { useRouter } from 'next/navigation';
import { TechnicalNetworkImport } from './TechnicalNetworkImport';
import { loadTechnicalNetwork } from '@/lib/technicalNetwork';

type Tab = 'products' | 'tecnicos';

export default function AdminView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);

  const { isPending, run } = usePendingAction();
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<{ table: 'products' | 'tecnicos'; id: string | number; name: string } | null>(null);
  const money = (n: number) => n.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const [isTecnicoModalOpen, setIsTecnicoModalOpen] = useState(false);
  const [editingTecnico, setEditingTecnico] = useState<Partial<Tecnico> | null>(null);

  const [productSearch, setProductSearch] = useState('');
  const [tecnicoSearch, setTecnicoSearch] = useState('');

  // Address search for technician modal
  interface NominatimResult { lat: string; lon: string; display_name: string; }
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResult[]>([]);
  const [loadingAddressSugg, setLoadingAddressSugg] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState('');
  const [showAddressSugg, setShowAddressSugg] = useState(false);
  const justSelectedAddressRef = useRef(false);
  useEffect(() => {
    setAddressSuggestions([]); setLoadingAddressSugg(false);
    if (justSelectedAddressRef.current) { justSelectedAddressRef.current = false; return; }
    if (!isTecnicoModalOpen || addressQuery.trim().length < 4) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoadingAddressSugg(true);
      try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(addressQuery.trim())}&limit=5&countrycode=BR`, {signal:controller.signal});
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) {
          setAddressSuggestions((data.features || []).map((item: {geometry:{coordinates:number[]};properties:Record<string,string>}) => ({lat:String(item.geometry.coordinates[1]),lon:String(item.geometry.coordinates[0]),display_name:Array.from(new Set([item.properties.name,item.properties.street,item.properties.housenumber,item.properties.city,item.properties.state,item.properties.postcode].filter(Boolean))).join(', ')})));
          setShowAddressSugg(true);
        }
      } catch { if (!controller.signal.aborted) setFormError('Não foi possível buscar o endereço. Tente novamente.'); }
      finally { if (!controller.signal.aborted) setLoadingAddressSugg(false); }
    }, 600);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [addressQuery, isTecnicoModalOpen]);

  const handleSelectAddress = (s: NominatimResult) => {
    justSelectedAddressRef.current = true;
    setAddressQuery(s.display_name);
    setAddressSuggestions([]);
    setShowAddressSugg(false);
    setAddressConfirmed(s.display_name);
    setEditingTecnico(prev => prev ? { ...prev, lat: parseFloat(s.lat), lng: parseFloat(s.lon) } : prev);
  };
  const [uploadingImage, setUploadingImage] = useState(false);

  const compressImage = (file: File, maxWidth = 400, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
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
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Imagem inválida')); };
      img.src = objectUrl;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError('');
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
      setFormError('Não foi possível enviar a imagem. Tente novamente ou use um link direto.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true); setLoadError('');
    try {
      const [prodRes, tecRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        loadTechnicalNetwork()
      ]);
      if (prodRes.error) throw new Error();
      setProducts(prodRes.data || []); setTecnicos(tecRes.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')));
    } catch { setLoadError('Não foi possível atualizar os registros. Tente novamente.'); }
    finally { setLoading(false); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || uploadingImage) return;
    await run(async () => {
      setFormError('');
      try {
        const payload = {...editingProduct, name:editingProduct.name?.trim(), monthly_fee:editingProduct.monthly_fee || 0};
        if (!payload.name || !Number.isFinite(payload.default_price) || payload.default_price! < 0 || payload.monthly_fee < 0) { setFormError('Confira o nome e os valores do produto.'); return false; }
        const response = editingProduct.id
          ? await supabase.from('products').update(payload).eq('id', editingProduct.id).select('id').single()
          : await supabase.from('products').insert([{...payload,id:`prod-${Date.now()}`,category_id:payload.category_id || 'cat-1',is_active:payload.is_active ?? true}]).select('id').single();
        if (response.error || !response.data) throw new Error();
        setIsProductModalOpen(false); setNotice('Produto salvo.'); await fetchData(); return true;
      } catch { setFormError('Não foi possível salvar o produto. Seus dados foram mantidos para tentar novamente.'); return false; }
    });
  };
  const handleSaveTecnico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTecnico) return;
    await run(async () => {
      setFormError('');
      const {id,...payload} = editingTecnico;
      if (!payload.nome?.trim() || !Number.isFinite(payload.lat) || !Number.isFinite(payload.lng) || (!addressConfirmed && (!id || (payload.lat === 0 && payload.lng === 0))) || (addressQuery && !addressConfirmed)) {
        setFormError('Preencha o nome e selecione um endereço sugerido para confirmar a localização.'); return false;
      }
      try {
        const response = id
          ? await supabase.from('tecnicos').update(payload).eq('id',id).select('id').single()
          : await supabase.from('tecnicos').insert([payload]).select('id').single();
        if (response.error || !response.data) throw new Error();
        setIsTecnicoModalOpen(false); setNotice('Técnico salvo.'); await fetchData(); return true;
      } catch { setFormError('Não foi possível salvar o técnico. Seus dados foram mantidos para tentar novamente.'); return false; }
    });
  };
  const confirmDelete = async () => {
    if (!deleting) return;
    await run(async () => {
      setFormError('');
      try {
        const response = await supabase.from(deleting.table).delete().eq('id',deleting.id).select('id').single();
        if (response.error || !response.data) throw new Error();
        setDeleting(null); setNotice('Registro excluído.'); await fetchData(); return true;
      } catch { setFormError('Não foi possível excluir. Tente novamente.'); return false; }
    });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredTecnicos = tecnicos.filter(t =>
    t.nome.toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.categoria || '').toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.tipo || '').toLowerCase().includes(tecnicoSearch.toLowerCase()) ||
    (t.vendedor_parceiro || '').toLowerCase().includes(tecnicoSearch.toLowerCase())
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Voltar ao assistente" onClick={() => router.push('/')}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-lg font-bold font-outfit">Administração</h1>
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
        {notice && <div role="status" className="admin-notice">{notice}<button className="ui-icon-button" aria-label="Fechar aviso" onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {loadError && <div role="alert" className="admin-notice">{loadError}<button className="ui-button ui-button-secondary" onClick={fetchData}>Tentar novamente</button></div>}
        {loading ? (
          <div role="status" aria-label="Carregando registros" className="flex justify-center py-20">
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
                      setEditingProduct({ category_id: 'cat-1', is_active: true, commercial_rules: { allow_pix: true, allow_boleto: true, allow_card: true, allow_financing: true, max_boleto_installments: 3, max_card_installments: 12 } });
                      setFormError(''); setIsProductModalOpen(true);
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
                    aria-label="Buscar produtos" placeholder="Buscar produtos por nome..."
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
                        {filteredProducts.length===0 && <tr><td colSpan={4} className="admin-empty">{productSearch ? 'Nenhum produto encontrado para esta busca.' : 'Nenhum produto cadastrado.'}</td></tr>}
                        {filteredProducts.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium">{p.name}</td>
                            <td className="px-4 py-3 text-slate-500">{money(p.default_price)}</td>
                            <td className="px-4 py-3 text-slate-500">{money(p.monthly_fee || 0)}</td>
                            <td className="px-4 py-3 flex items-center justify-end gap-2">
                              <button
                                aria-label={`Editar ${p.name}`} onClick={() => { setEditingProduct(p); setFormError(''); setIsProductModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                aria-label={`Excluir ${p.name}`} onClick={() => {setFormError('');setDeleting({table:'products',id:p.id,name:p.name});}}
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
                <div className="technical-admin-heading">
                  <h2 className="text-lg font-bold">Gestão de Técnicos</h2>
                  <div className="technical-admin-actions"><TechnicalNetworkImport onUpdated={async message=>{setNotice(message);await fetchData();}} />
                  <button
                    onClick={() => {
                      setEditingTecnico({ lat: 0, lng: 0 });
                      setAddressQuery('');
                      setAddressConfirmed('');
                      setAddressSuggestions([]);
                      setFormError(''); setIsTecnicoModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Técnico
                  </button>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    aria-label="Buscar técnicos" placeholder="Nome, categoria, tipo ou parceiro..."
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
                          <th className="px-4 py-3 font-semibold">Categoria / tipo</th>
                          <th className="px-4 py-3 font-semibold">Parceiro</th>
                          <th className="px-4 py-3 font-semibold text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {filteredTecnicos.length===0 && <tr><td colSpan={4} className="admin-empty">{tecnicoSearch ? 'Nenhum técnico encontrado para esta busca.' : 'Nenhum técnico cadastrado.'}</td></tr>}
                        {filteredTecnicos.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <td className="px-4 py-3 font-medium max-w-[200px] truncate" title={t.nome}>{t.nome}{t.is_active === false && <small className="block text-amber-600">Inativo</small>}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {t.categoria} • {t.tipo}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{t.vendedor_parceiro || '-'}</td>
                            <td className="px-4 py-3 flex items-center justify-end gap-2">
                              <button
                                aria-label={`Editar ${t.nome}`} onClick={() => { setEditingTecnico(t); setAddressQuery(''); setAddressConfirmed(''); setAddressSuggestions([]); setFormError(''); setIsTecnicoModalOpen(true); }}
                                className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                aria-label={`Excluir ${t.nome}`} onClick={() => {setFormError('');setDeleting({table:'tecnicos',id:t.id,name:t.nome});}}
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
        <QuoteDialog className="admin-editor" label={editingProduct.id ? 'Editar Produto' : 'Novo Produto'} canClose={!isPending && !uploadingImage} onClose={()=>setIsProductModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">{editingProduct.id ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button aria-label="Fechar formulário" disabled={isPending || uploadingImage} onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">{formError && <p role="alert" className="admin-error">{formError}</p>}
              <form id="productForm" onSubmit={handleSaveProduct} className="space-y-4"><fieldset disabled={isPending || uploadingImage} className="space-y-4">
                <div>
                  <label htmlFor="admin-field-1" className="block text-xs font-semibold mb-1">Nome do Produto</label>
                  <input id="admin-field-1" type="text" value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                </div>
                <div>
                  <label htmlFor="admin-field-2" className="block text-xs font-semibold mb-1">Categoria no Catálogo</label>
                  <select id="admin-field-2"
                    value={editingProduct.category_id || 'cat-1'}
                    onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium"
                  >
                    <option value="cat-1">Equipamentos Principais (Rastreadores / Dashcams)</option>
                    <option value="cat-2">Acessórios & Sensores</option>
                    <option value="cat-3">Iscas de Carga (Descartáveis / Retornáveis)</option>
                    <option value="cat-4">Serviços & Licenças</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="admin-field-3" className="block text-xs font-semibold mb-1">Descrição</label>
                  <textarea id="admin-field-3" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-field-4" className="block text-xs font-semibold mb-1">Preço Base (R$)</label>
                    <input id="admin-field-4" type="number" min="0" step="0.01" value={editingProduct.default_price ?? ''} onChange={e => setEditingProduct({...editingProduct, default_price: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                  </div>
                  <div>
                    <label htmlFor="admin-field-5" className="block text-xs font-semibold mb-1">Mensalidade (R$)</label>
                    <input id="admin-field-5" type="number" min="0" step="0.01" value={editingProduct.monthly_fee || ''} onChange={e => setEditingProduct({...editingProduct, monthly_fee: parseFloat(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
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
                      <label htmlFor="admin-field-6" className="block text-[10px] text-slate-500 font-medium mb-1">Ou cole um link direto:</label>
                      <input id="admin-field-6"
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
              </fieldset></form>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" disabled={isPending || uploadingImage} onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
              <button disabled={isPending || uploadingImage} type="submit" form="productForm" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors">{isPending ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </QuoteDialog>
      )}

      {/* MODAL TECNICO */}
      {isTecnicoModalOpen && editingTecnico && (
        <QuoteDialog className="admin-editor" label={editingTecnico.id ? 'Editar Técnico' : 'Novo Técnico'} canClose={!isPending && !uploadingImage} onClose={()=>setIsTecnicoModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold">{editingTecnico.id ? 'Editar Técnico' : 'Novo Técnico'}</h3>
              <button aria-label="Fechar formulário" disabled={isPending || uploadingImage} onClick={() => setIsTecnicoModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">{formError && <p role="alert" className="admin-error">{formError}</p>}
              <form id="tecnicoForm" onSubmit={handleSaveTecnico} className="space-y-4"><fieldset disabled={isPending || uploadingImage} className="space-y-4">
                <div>
                  <label htmlFor="admin-field-7" className="block text-xs font-semibold mb-1">Nome Completo</label>
                  <input id="admin-field-7" type="text" value={editingTecnico.nome || ''} onChange={e => setEditingTecnico({...editingTecnico, nome: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-field-8" className="block text-xs font-semibold mb-1">Categoria</label>
                    <select id="admin-field-8"
                      value={editingTecnico.categoria || ''}
                      onChange={e => setEditingTecnico({...editingTecnico, categoria: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Sem categoria</option>
                      {editingTecnico.categoria && !['REDE PLUS','PSO','ATA','SPOT'].includes(editingTecnico.categoria) && <option value={editingTecnico.categoria}>{editingTecnico.categoria}</option>}
                      <option value="REDE PLUS">REDE PLUS</option>
                      <option value="PSO">PSO</option>
                      <option value="ATA">ATA</option>
                      <option value="SPOT">SPOT</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="admin-field-9" className="block text-xs font-semibold mb-1">Tipo (ex: Fixo, Volante)</label>
                    <input id="admin-field-9" type="text" value={editingTecnico.tipo || ''} onChange={e => setEditingTecnico({...editingTecnico, tipo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin-field-10" className="block text-xs font-semibold mb-1">Telefone</label>
                    <input id="admin-field-10" type="text" value={editingTecnico.telefone || ''} onChange={e => setEditingTecnico({...editingTecnico, telefone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label htmlFor="admin-field-11" className="block text-xs font-semibold mb-1">Email</label>
                    <input id="admin-field-11" type="email" value={editingTecnico.email || ''} onChange={e => setEditingTecnico({...editingTecnico, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                </div>
                {/* Address Search — replaces manual lat/lng */}
                <div>
                  <label className="block text-xs font-semibold mb-1">Localização (endereço ou CEP)</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    {loadingAddressSugg && <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />}
                    <input
                      aria-label="Localização (endereço ou CEP)" type="text"
                      placeholder="Ex: Av. Paulista, São Paulo ou 01310-100"
                      value={addressQuery}
                      onChange={e => { setAddressQuery(e.target.value); setAddressConfirmed(''); setFormError(''); }}
                      onFocus={() => addressSuggestions.length > 0 && setShowAddressSugg(true)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    {addressQuery && (
                      <button type="button" onClick={() => { setAddressQuery(''); setAddressConfirmed(''); setAddressSuggestions([]); setEditingTecnico(prev => prev ? { ...prev, lat: 0, lng: 0 } : prev); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {showAddressSugg && addressSuggestions.length > 0 && (
                      <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {addressSuggestions.map((s, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              onClick={() => handleSelectAddress(s)}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                            >
                              <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                              <span className="text-slate-700 dark:text-slate-200 leading-tight">{s.display_name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Confirmation badge */}
                  {addressConfirmed && editingTecnico.lat !== 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">📍 {addressConfirmed}</span>
                    </div>
                  )}
                  {editingTecnico.id && !addressQuery && <p className="admin-help">Localização cadastrada preservada. Busque um endereço apenas para alterá-la.</p>}
                  {/* Stored coordinates */}
                  <input type="hidden" value={editingTecnico.lat || ''} required />
                  <input type="hidden" value={editingTecnico.lng || ''} required />
                </div>
                <div>
                  <label htmlFor="admin-field-12" className="block text-xs font-semibold mb-1">Vendedor Parceiro associado (opcional)</label>
                  <input id="admin-field-12" type="text" value={editingTecnico.vendedor_parceiro || ''} onChange={e => setEditingTecnico({...editingTecnico, vendedor_parceiro: e.target.value})} placeholder="Nome do vendedor" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                </div>
              </fieldset></form>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" disabled={isPending || uploadingImage} onClick={() => setIsTecnicoModalOpen(false)} className="px-4 py-2 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
              <button disabled={isPending || uploadingImage} type="submit" form="tecnicoForm" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-colors">{isPending ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </QuoteDialog>
      )}
      {deleting && <QuoteDialog className="admin-editor admin-confirm" label="Excluir registro" canClose={!isPending} onClose={()=>setDeleting(null)}>
        <div className="admin-confirm-body"><h2>Excluir registro?</h2><p>Você vai excluir <strong>{deleting.name}</strong>. Esta ação não pode ser desfeita.</p>{formError && <p role="alert" className="admin-error">{formError}</p>}
        <div className="admin-confirm-actions"><button className="ui-button ui-button-secondary" disabled={isPending} onClick={()=>setDeleting(null)}>Cancelar</button><button className="ui-button admin-danger" disabled={isPending} onClick={confirmDelete}>{isPending?'Excluindo…':'Excluir'}</button></div></div>
      </QuoteDialog>}
    </div>
  );
}
