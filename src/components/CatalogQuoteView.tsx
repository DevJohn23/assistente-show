'use client';

import React, { useState } from 'react';
import { Product, CartItem, QuoteTemplate } from '@/types';
import { 
  Search, 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Copy, 
  Calculator, 
  Sparkles, 
  BookmarkPlus, 
  X,
  CreditCard,
  QrCode,
  FileText,
  CheckCircle,
  Eye
} from 'lucide-react';

interface CatalogQuoteViewProps {
  products: Product[];
  templates: QuoteTemplate[];
  onSaveTemplate: (name: string, items: { product_id: string; quantity: number }[]) => void;
}

export const CatalogQuoteView: React.FC<CatalogQuoteViewProps> = ({
  products,
  templates,
  onSaveTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  // Payment option toggles
  const [payPix, setPayPix] = useState(true);
  const [payBoleto, setPayBoleto] = useState(true);
  const [boletoInstallments, setBoletoInstallments] = useState(3);
  const [payCard, setPayCard] = useState(true);
  const [cardInstallments, setCardInstallments] = useState(10);
  
  // Ideal Installment Simulator State
  const [targetInstallment, setTargetInstallment] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Cart operations
  const toggleCartItem = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.filter((item) => item.product.id !== product.id);
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const isProductInCart = (productId: string) => {
    return cart.some((item) => item.product.id === productId);
  };

  // Search & Suggestions
  const searchResults = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const suggestions = searchTerm.trim().length > 0
    ? products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Totals calculations
  const subtotalEquipment = cart.reduce((acc, item) => acc + item.product.default_price * item.quantity, 0);
  const totalMonthlyFee = cart.reduce((acc, item) => acc + (item.product.monthly_fee || 0) * item.quantity, 0);
  
  const discountAmount = (subtotalEquipment * (discountPercent || 0)) / 100;
  const finalEquipmentPrice = subtotalEquipment - discountAmount;

  // Simulator logic (Parcela Desejada)
  const handleCalculateSimulator = () => {
    const target = parseFloat(targetInstallment);
    if (!target || target <= 0 || finalEquipmentPrice <= 0) return;

    let bestInstallments = 1;
    for (let i = 1; i <= 12; i++) {
      const installmentValue = finalEquipmentPrice / i;
      if (installmentValue <= target) {
        bestInstallments = i;
        break;
      }
    }

    if (bestInstallments === 1 && finalEquipmentPrice / 12 > target) {
      setSimulationResult("Será necessário financiamento.");
    } else {
      const val = finalEquipmentPrice / bestInstallments;
      setSimulationResult(`${bestInstallments}x de R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    }
  };

  // Generate Message Text
  const generateMessageText = () => {
    if (cart.length === 0) return "Adicione produtos ao orçamento para gerar a mensagem.";

    let msg = `Olá!\n\nSegue o orçamento solicitado.\n\nProdutos:\n`;
    cart.forEach((item) => {
      msg += `• ${item.quantity}x ${item.product.name} - R$ ${(item.product.default_price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    });

    if (totalMonthlyFee > 0) {
      msg += `\nMensalidades dos serviços:\nR$ ${totalMonthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês\n`;
    }

    msg += `\nValor total dos equipamentos:\nR$ ${subtotalEquipment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;

    if (discountPercent > 0) {
      msg += `\n🎁 Desconto especial aplicado: ${discountPercent}%.\n`;
    }

    msg += `\nFormas de pagamento:\n`;

    if (payPix) {
      const pixTotal = finalEquipmentPrice;
      msg += `• PIX à vista - R$ ${pixTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }

    if (payBoleto && boletoInstallments > 0) {
      const boletoVal = finalEquipmentPrice / boletoInstallments;
      msg += `• ${boletoInstallments}x no boleto sem juros - ${boletoInstallments}x de R$ ${boletoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }

    if (payCard && cardInstallments > 0) {
      const cardVal = finalEquipmentPrice / cardInstallments;
      msg += `• ${cardInstallments}x no cartão sem juros - ${cardInstallments}x de R$ ${cardVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    }

    msg += `\nCaso tenha qualquer dúvida, fico à disposição.`;
    return msg;
  };

  const handleCopyMessage = () => {
    const text = generateMessageText();
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Load template into cart
  const handleLoadTemplate = (tpl: QuoteTemplate) => {
    const newCart: CartItem[] = [];
    tpl.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        newCart.push({ product: prod, quantity: item.quantity });
      }
    });
    setCart(newCart);
  };

  const handleSaveTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || cart.length === 0) return;
    onSaveTemplate(
      newTemplateName,
      cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
    );
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Search & Kit Templates Bar */}
      <div className="clean-card p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
        {/* Autocomplete Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar equipamento por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />

          {/* Autocomplete Suggestions Box */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 overflow-hidden max-h-56 overflow-y-auto">
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  onClick={() => {
                    setSearchTerm(sug.name);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800/60 last:border-none"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{sug.name}</span>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">
                    R$ {sug.default_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load Template Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Kits:</span>
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => handleLoadTemplate(tpl)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-medium text-sky-700 dark:text-sky-300 transition-all whitespace-nowrap flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>{tpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid + Cart Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column: Products Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-outfit">Catálogo de Equipamentos Omnilink</h3>
            <span className="text-xs text-slate-400">{searchResults.length} produtos</span>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {searchResults.map((product) => {
              const inCart = isProductInCart(product.id);
              return (
                <div
                  key={product.id}
                  className={`clean-card rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                    inCart ? 'border-sky-500 dark:border-sky-500/60 bg-sky-50/30 dark:bg-sky-950/20' : ''
                  }`}
                >
                  <div>
                    {/* Image */}
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative mb-2.5">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.monthly_fee && product.monthly_fee > 0 ? (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                          R$ {product.monthly_fee.toFixed(2)}/mês
                        </span>
                      ) : null}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">{product.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">À Vista</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                        R$ {product.default_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDetailProduct(product)}
                        title="Ver Detalhes"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleCartItem(product)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                          inCart
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Carrinho do Orçamento */}
        <div className="clean-card p-4 rounded-2xl space-y-4 sticky top-6">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">Carrinho do Orçamento</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={() => setShowSaveTemplateModal(true)}
                title="Salvar Combinação como Modelo"
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Salvar Kit</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="py-6 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum produto selecionado.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Clique em "Adicionar" nos equipamentos ao lado.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white block truncate text-[11px]">{item.product.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      R$ {item.product.default_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-1.5 font-semibold text-slate-900 dark:text-white font-mono text-[11px]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-0.5 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => toggleCartItem(item.product)}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtotal & Discount */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Subtotal Equipamentos:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">
                R$ {subtotalEquipment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {totalMonthlyFee > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span>Mensalidades Totais:</span>
                <span className="font-bold font-mono">
                  R$ {totalMonthlyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                </span>
              </div>
            )}

            {/* Discount % Input */}
            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <label className="text-slate-500 dark:text-slate-400 font-medium">Aplicar Desconto (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                <span>Valor Desconto:</span>
                <span className="font-mono">- R$ {discountAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
              <span>Total Equipamentos:</span>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400 font-outfit">
                R$ {finalEquipmentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Formas de Pagamento Options */}
          <div className="space-y-1.5 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[10px]">
              Formas de Pagamento no Orçamento
            </span>

            {/* PIX */}
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={payPix}
                  onChange={(e) => setPayPix(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
                />
                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-slate-800 dark:text-slate-200">PIX à Vista</span>
              </div>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                R$ {finalEquipmentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </label>

            {/* Boleto */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payBoleto}
                    onChange={(e) => setPayBoleto(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Boleto Sem Juros</span>
                </label>

                {payBoleto && (
                  <select
                    value={boletoInstallments}
                    onChange={(e) => setBoletoInstallments(parseInt(e.target.value))}
                    className="px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white"
                  >
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x (máx)</option>
                  </select>
                )}
              </div>
            </div>

            {/* Cartão */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={payCard}
                    onChange={(e) => setPayCard(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <CreditCard className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Cartão de Crédito</span>
                </label>

                {payCard && (
                  <select
                    value={cardInstallments}
                    onChange={(e) => setCardInstallments(parseInt(e.target.value))}
                    className="px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-900 dark:text-white"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Simulador de Parcela Ideal */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Parcela Ideal</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Parcela desejada (ex: 700)"
                value={targetInstallment}
                onChange={(e) => setTargetInstallment(e.target.value)}
                className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
              />
              <button
                onClick={handleCalculateSimulator}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs"
              >
                Calcular
              </button>
            </div>

            {simulationResult && (
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                Resultado: {simulationResult}
              </p>
            )}
          </div>

          {/* Action: Copy WhatsApp Message */}
          <button
            onClick={handleCopyMessage}
            disabled={cart.length === 0}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              cart.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {copiedNotification ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Mensagem Copiada! 🚀</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Gerar e Copiar Mensagem</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-xl relative">
            <button
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 mb-3">
              <img src={detailProduct.image_url} alt={detailProduct.name} className="w-full h-full object-cover" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">{detailProduct.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{detailProduct.description}</p>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Preço à vista</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                  R$ {detailProduct.default_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {detailProduct.monthly_fee ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Mensalidade</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {detailProduct.monthly_fee.toFixed(2)}/mês
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDetailProduct(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  toggleCartItem(detailProduct);
                  setDetailProduct(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar ao Orçamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-xl relative">
            <button
              onClick={() => setShowSaveTemplateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-outfit">Salvar Combinação de Orçamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Crie um Kit padrão para reutilizar esta combinação de produtos em futuros atendimentos.
            </p>

            <form onSubmit={handleSaveTemplateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Kit / Modelo</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Kit Cavalo Mecânico Completo"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
