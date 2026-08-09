'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import {
  SmartQuoteConfig,
  getRecommendedProducts,
} from '@/lib/smartQuoteRules';
import {
  Truck,
  Car,
  ShieldCheck,
  Check,
  Plus,
  Search,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SmartQuoteWizardProps {
  products: Product[];
  onAddItemsToCart: (items: { product: Product; quantity: number }[]) => void;
  onSwitchToStandardCatalog?: () => void;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const SmartQuoteWizard: React.FC<SmartQuoteWizardProps> = ({
  products,
  onAddItemsToCart,
}) => {
  // Configuração do Veículo
  const [config, setConfig] = useState<SmartQuoteConfig>({
    category: 'truck_mono',
    rearDoorType: 'double_leaf',
    hasSideDoor: true,
    isRefrigerated: false,
    tractorHasTrailer: true,
    tractorTrailerIsBox: false,
    includeFifthWheel: true,
  });

  // Recomendações Dinâmicas (desmarcadas por padrão)
  const recommendations = useMemo(() => {
    return getRecommendedProducts(config, products);
  }, [config, products]);

  // Conjunto de IDs selecionados (desmarcados por padrão)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Resetar seleções ao mudar a configuração de veículos
  React.useEffect(() => {
    setSelectedIds(new Set());
  }, [config]);

  // Busca Auxiliar no Wizard
  const [extraSearch, setExtraSearch] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    const itemsToAdd = recommendations
      .filter((r) => selectedIds.has(r.product.id))
      .map((r) => ({
        product: r.product,
        quantity: 1,
      }));

    if (itemsToAdd.length === 0) return;

    onAddItemsToCart(itemsToAdd);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  // Produtos extras filtrados pela busca auxiliar
  const extraProducts = useMemo(() => {
    if (!extraSearch.trim()) return [];
    const term = extraSearch.toLowerCase();
    return products.filter((p) => {
      const isAlreadyRecommended = recommendations.some((r) => r.product.id === p.id);
      if (isAlreadyRecommended) return false;
      return (
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }).slice(0, 5);
  }, [extraSearch, products, recommendations]);

  const addExtraProductToCart = (product: Product) => {
    onAddItemsToCart([{ product, quantity: 1 }]);
    setExtraSearch('');
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Grid Principal: Filtros de Veículo (Esquerda) vs Cards de Produtos (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Painel da Esquerda: Escolha de Veículo & Configurações (4 Colunas) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. Perfil do Veículo */}
          <div className="clean-card p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              1. Perfil do Veículo
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {/* Caminhão Monobloco */}
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, category: 'truck_mono' }))}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  config.category === 'truck_mono'
                    ? 'bg-sky-500/10 border-sky-500/50 shadow-md text-white'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.category === 'truck_mono' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs font-outfit">Caminhão Rígido / Baú Monobloco</h4>
              </button>

              {/* Cavalo Mecânico */}
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, category: 'tractor' }))}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  config.category === 'tractor'
                    ? 'bg-sky-500/10 border-sky-500/50 shadow-md text-white'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.category === 'tractor' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs font-outfit">Cavalo Mecânico (Articulado)</h4>
              </button>

              {/* Van / Fiorino */}
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, category: 'van_utilitarian' }))}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                  config.category === 'van_utilitarian'
                    ? 'bg-sky-500/10 border-sky-500/50 shadow-md text-white'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${config.category === 'van_utilitarian' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Car className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs font-outfit">Van / Fiorino / Utilitário Leve</h4>
              </button>
            </div>
          </div>

          {/* 2. Especificações do Veículo */}
          <div className="clean-card p-4 rounded-2xl space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              2. Especificações do Veículo
            </h3>

            {/* Opções para CAMINHÃO MONOBLOCO */}
            {config.category === 'truck_mono' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Porta Traseira:</label>
                  <select
                    value={config.rearDoorType}
                    onChange={(e) => setConfig((prev) => ({ ...prev, rearDoorType: e.target.value as any }))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    <option value="double_leaf">Porta de 2 Folhas (Folha Dupla)</option>
                    <option value="roll_up">Porta de Enrolar (Roll-Up)</option>
                    <option value="none">Sem Trava Traseira / Aberto</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Possui Porta Lateral no Baú?</span>
                  <input
                    type="checkbox"
                    checked={config.hasSideDoor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, hasSideDoor: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Baú Refrigerado / Frigorífico?</span>
                  <input
                    type="checkbox"
                    checked={config.isRefrigerated}
                    onChange={(e) => setConfig((prev) => ({ ...prev, isRefrigerated: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* Opções para CAVALO MECÂNICO */}
            {config.category === 'tractor' && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Engata / Desengata?</span>
                  <input
                    type="checkbox"
                    checked={config.tractorHasTrailer}
                    onChange={(e) => setConfig((prev) => ({ ...prev, tractorHasTrailer: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>

                {/* Se engata/desengata, pergunta se a carreta é tipo Baú */}
                {config.tractorHasTrailer && (
                  <>
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                      <span className="text-xs text-slate-300 font-medium">A carreta é do tipo Baú?</span>
                      <input
                        type="checkbox"
                        checked={config.tractorTrailerIsBox}
                        onChange={(e) => setConfig((prev) => ({ ...prev, tractorTrailerIsBox: e.target.checked }))}
                        className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                      />
                    </label>

                    {/* Opções de porta e refrigeração da carreta baú */}
                    {config.tractorTrailerIsBox && (
                      <div className="pl-3 space-y-2.5 border-l-2 border-sky-500/40">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-300 block">Porta Traseira da Carreta:</label>
                          <select
                            value={config.rearDoorType}
                            onChange={(e) => setConfig((prev) => ({ ...prev, rearDoorType: e.target.value as any }))}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                          >
                            <option value="double_leaf">Porta de 2 Folhas (Folha Dupla)</option>
                            <option value="roll_up">Porta de Enrolar (Roll-Up)</option>
                            <option value="none">Sem Trava Traseira / Aberto</option>
                          </select>
                        </div>

                        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                          <span className="text-[11px] text-slate-300 font-medium">Porta Lateral na Carreta?</span>
                          <input
                            type="checkbox"
                            checked={config.hasSideDoor}
                            onChange={(e) => setConfig((prev) => ({ ...prev, hasSideDoor: e.target.checked }))}
                            className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer"
                          />
                        </label>

                        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                          <span className="text-[11px] text-slate-300 font-medium">Carreta Frigorífica / Refrigerada?</span>
                          <input
                            type="checkbox"
                            checked={config.isRefrigerated}
                            onChange={(e) => setConfig((prev) => ({ ...prev, isRefrigerated: e.target.checked }))}
                            className="w-3.5 h-3.5 accent-sky-500 rounded cursor-pointer"
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Incluir Trava de Quinta Roda & Aríete?</span>
                  <input
                    type="checkbox"
                    checked={config.includeFifthWheel}
                    onChange={(e) => setConfig((prev) => ({ ...prev, includeFifthWheel: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}

            {/* Opções para VAN / UTILITÁRIO */}
            {config.category === 'van_utilitarian' && (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                  <span className="text-xs text-slate-300 font-medium">Possui Porta Lateral de Correr?</span>
                  <input
                    type="checkbox"
                    checked={config.hasSideDoor}
                    onChange={(e) => setConfig((prev) => ({ ...prev, hasSideDoor: e.target.checked }))}
                    className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Painel da Direita: CARDS ENXUTOS (2 por linha) + Busca Discreta no Topo (8 Colunas) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="clean-card p-4 rounded-2xl flex flex-col justify-between space-y-3.5">
            
            {/* Cabeçalho da Seção com Busca Discreta no Topo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm font-outfit">
                  Equipamentos Recomendados ({recommendations.length})
                </h3>
              </div>

              {/* Campo de Busca Discreto no Topo */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar outro item no catálogo..."
                  value={extraSearch}
                  onChange={(e) => setExtraSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Dropdown/Lista da Busca Extra quando houver termo pesquisado */}
            {extraProducts.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto bg-slate-950 p-2 rounded-xl border border-slate-800 shadow-md">
                {extraProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-1.5 rounded-lg hover:bg-slate-900 flex items-center justify-between text-xs text-slate-300"
                  >
                    <span className="truncate pr-2 font-medium">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => addExtraProductToCart(p)}
                      className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* GRID DE CARDS (EXATAMENTE 2 POR LINHA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {recommendations.map((rec) => {
                const isSelected = selectedIds.has(rec.product.id);

                return (
                  <div
                    key={rec.product.id}
                    onClick={() => toggleSelect(rec.product.id)}
                    className={`clean-card rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'border-sky-500 shadow-lg bg-sky-950/20'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      {/* Imagem do Produto com Checkbox no Canto */}
                      <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 relative mb-3 group">
                        <img
                          src={rec.product.image_url}
                          alt={rec.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Checkbox no Canto Superior Esquerdo */}
                        <div
                          className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-md flex items-center justify-center border shadow-md transition-all ${
                            isSelected
                              ? 'bg-sky-500 border-sky-400 text-white'
                              : 'bg-slate-900/80 border-slate-700 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>

                        {/* Mensalidade Badge se houver */}
                        {rec.product.monthly_fee && rec.product.monthly_fee > 0 ? (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                            R$ {rec.product.monthly_fee.toFixed(2)}/mês
                          </span>
                        ) : null}
                      </div>

                      {/* Nome do Produto */}
                      <h4 className="font-bold text-white text-xs font-outfit line-clamp-2 leading-snug">
                        {rec.product.name}
                      </h4>
                    </div>

                    {/* Preço À Vista no Rodapé do Card */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium">À Vista</span>
                      <span className="text-xs font-bold text-sky-400 font-mono">
                        R$ {formatCurrency(rec.product.default_price)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOTÃO FIXO DE ADICIONAR SELECIONADOS AO ORÇAMENTO */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddSelected}
                disabled={selectedIds.size === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm font-outfit shadow-lg transition-all flex items-center justify-center gap-2 ${
                  selectedIds.size > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer shadow-emerald-950/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {addedNotice
                  ? '✨ Itens Adicionados ao Orçamento!'
                  : `Adicionar Marcados ao Orçamento (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
