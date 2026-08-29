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
  Eye,
  Radio,
  Wrench,
  Landmark,
  Layers,
  MoreVertical,
  Edit3
} from 'lucide-react';
import { SmartQuoteWizard } from '@/components/SmartQuoteWizard';

interface CatalogQuoteViewProps {
  products: Product[];
  templates: QuoteTemplate[];
  onSaveTemplate: (name: string, items: { product_id: string; quantity: number }[]) => void;
  onUpdateTemplate?: (id: string, updated: Partial<QuoteTemplate>) => void;
  onDeleteTemplate?: (id: string) => void;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const CatalogQuoteView: React.FC<CatalogQuoteViewProps> = ({
  products,
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Catalog View Mode: 'standard' | 'smart'
  const [catalogMode, setCatalogMode] = useState<'standard' | 'smart'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_catalog_mode');
      if (saved === 'smart' || saved === 'standard') return saved;
    }
    return 'standard';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_catalog_mode', catalogMode);
    }
  }, [catalogMode]);
  
  // Cart & Quote state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_cart');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  const [markupPercent, setMarkupPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_quote_markup');
      if (saved) return parseFloat(saved) || 0;
    }
    return 0;
  });

  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_quote_discount');
      if (saved) return parseFloat(saved) || 0;
    }
    return 0;
  });

  // Payment option toggles
  const [includeMonthlyFee, setIncludeMonthlyFee] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_quote_include_monthly');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [requireEntryFee, setRequireEntryFee] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_quote_require_entry_fee');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  const [payPix, setPayPix] = useState(true);
  const [payBoleto, setPayBoleto] = useState(true);
  const [boletoInstallments, setBoletoInstallments] = useState(3);
  const [payCard, setPayCard] = useState(true);
  const [cardInstallments, setCardInstallments] = useState(12);
  const [payFinancing, setPayFinancing] = useState(false);
  const [financingInstallments, setFinancingInstallments] = useState<number[]>([36]);

  const FINANCING_CHIP_OPTIONS = [10, 12, 18, 24, 30, 36];

  const toggleFinancingInstallment = (n: number) => {
    setFinancingInstallments(prev =>
      prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n].sort((a, b) => a - b)
    );
  };

  // Sync state to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_cart', JSON.stringify(cart));
    }
  }, [cart]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_quote_markup', markupPercent.toString());
    }
  }, [markupPercent]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_quote_discount', discountPercent.toString());
    }
  }, [discountPercent]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_quote_include_monthly', includeMonthlyFee.toString());
    }
  }, [includeMonthlyFee]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_quote_require_entry_fee', requireEntryFee.toString());
    }
  }, [requireEntryFee]);

  // ============================================================
  // FATORES EXATOS DA FERRAMENTA OFICIAL (derivados de 36 cenários com P=6930)
  // PMT = principal × PMT_FACTORS[n]
  // Crédito Total = principal × CREDIT_FACTORS[n]
  // TAC = principal × 0.03 (invariante)
  // IOF = Crédito - principal - TAC
  // Os fatores são lineares em P, portanto válidos para qualquer valor de principal.
  // ============================================================
  const TAXA_JUROS_MENSAL = 2.82; // exibição apenas (usado se n fora de 1-36)

  const PMT_FACTORS: Record<number, number> = {
    1:  1.066758,
    2:  0.541457,
    3:  0.366424,
    4:  0.278948,
    5:  0.226499,
    6:  0.191563,
    7:  0.166629,
    8:  0.147951,
    9:  0.133443,
    10: 0.121856,
    11: 0.112390,
    12: 0.104518,
    13: 0.097851,
    14: 0.092136,
    15: 0.087183,
    16: 0.082851,
    17: 0.079033,
    18: 0.075642,
    19: 0.072612,
    20: 0.069890,
    21: 0.067431,
    22: 0.065201,
    23: 0.063167,
    24: 0.061309,
    25: 0.059603,
    26: 0.058033,
    27: 0.056583,
    28: 0.055241,
    29: 0.053996,
    30: 0.052837,
    31: 0.051756,
    32: 0.050747,
    33: 0.049804,
    34: 0.048918,
    35: 0.048087,
    36: 0.047304,
  };

  const CREDIT_FACTORS: Record<number, number> = {
    1:  1.036538,
    2:  1.037808,
    3:  1.039105,
    4:  1.040390,
    5:  1.041685,
    6:  1.042986,
    7:  1.044254,
    8:  1.045532,
    9:  1.046810,
    10: 1.048094,
    11: 1.049375,
    12: 1.050661,
    13: 1.051750,
    14: 1.052683,
    15: 1.053492,
    16: 1.054199,
    17: 1.054824,
    18: 1.055380,
    19: 1.055876,
    20: 1.056322,
    21: 1.056727,
    22: 1.057094,
    23: 1.057430,
    24: 1.057737,
    25: 1.058020,
    26: 1.058281,
    27: 1.058524,
    28: 1.058749,
    29: 1.058958,
    30: 1.059153,
    31: 1.059335,
    32: 1.059506,
    33: 1.059667,
    34: 1.059818,
    35: 1.059961,
    36: 1.060097,
  };

  const calcularSimulacaoFinanciamento = (
    valorVenda: number,
    entrada: number,
    desconto: number,
    parcelas: number,
    taxaJurosMensal: number
  ) => {
    const principal = valorVenda - entrada - desconto;
    if (principal <= 0 || parcelas <= 0) {
      return { valorPrincipal: 0, taxaTac: 0, iofFixo: 0, iofDiario: 0, iofTotal: 0, valorTotalCredito: 0, valorParcela: 0, valorTotalDivida: 0 };
    }
    const tac = principal * 0.03;
    const n = parcelas;

    let valorParcela: number;
    let totalCredito: number;

    if (PMT_FACTORS[n] && CREDIT_FACTORS[n]) {
      // Usa fatores exatos derivados dos dados oficiais (n = 1 a 36)
      valorParcela = principal * PMT_FACTORS[n];
      totalCredito = principal * CREDIT_FACTORS[n];
    } else {
      // Fallback para n fora de 1-36: fórmula Price com TAC + IOF estimado
      const i = taxaJurosMensal / 100;
      let diasSum = 0;
      for (let k = 1; k <= n; k++) diasSum += Math.min(k * 30, 365);
      const mediaDias = diasSum / n;
      const base = principal + tac;
      const iofTotal = base * (0.003978 + 0.000082 * mediaDias);
      totalCredito = principal + tac + iofTotal;
      valorParcela = i > 0
        ? totalCredito * ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1))
        : totalCredito / n;
    }

    const iofTotal = parseFloat((totalCredito - principal - tac).toFixed(2));
    return {
      valorPrincipal: parseFloat(principal.toFixed(2)),
      taxaTac: parseFloat(tac.toFixed(2)),
      iofFixo: 0,
      iofDiario: iofTotal,
      iofTotal,
      valorTotalCredito: parseFloat(totalCredito.toFixed(2)),
      valorParcela: parseFloat(valorParcela.toFixed(2)),
      valorTotalDivida: parseFloat((valorParcela * n).toFixed(2)),
    };
  };


  // Modals state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const [showManageKitsModal, setShowManageKitsModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);
  // Financing Calculator Modal
  const [showFinancingCalcModal, setShowFinancingCalcModal] = useState(false);
  const [calcValue, setCalcValue] = useState('');
  const [calcCurrentN, setCalcCurrentN] = useState(12);
  const calcNumericValue = parseFloat(calcValue.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

  // Cart operations
  const toggleCartItem = (product: Product) => {
    const existingIndex = cart.findIndex((i) => i.product.id === product.id);
    if (existingIndex > -1) {
      setCart((prev) => prev.filter((i) => i.product.id !== product.id));
    } else {
      setCart((prev) => [...prev, { product, quantity: 1 }]);
    }
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
    return cart.some((i) => i.product.id === productId);
  };

  const addMultipleItemsToCart = (items: { product: Product; quantity: number }[]) => {
    setCart((prev) => {
      const nextCart = [...prev];
      items.forEach(({ product, quantity }) => {
        const idx = nextCart.findIndex((i) => i.product.id === product.id);
        if (idx > -1) {
          nextCart[idx] = {
            ...nextCart[idx],
            quantity: nextCart[idx].quantity + quantity,
          };
        } else {
          nextCart.push({ product, quantity });
        }
      });
      return nextCart;
    });
  };

  // Helper to normalize accents (ignore diacritics like ~ ^ ´ ` ç)
  const normalizeText = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  // Filter products directly without floating box & ignoring accents
  const searchResults = products.filter((p) => {
    const term = normalizeText(searchTerm);
    const nameMatch = normalizeText(p.name || '').includes(term);
    const descMatch = normalizeText(p.description || '').includes(term);
    return nameMatch || descMatch;
  });

  // Categorized products matching the PRD
  const trackerProducts = searchResults.filter((p) => p.category_id === 'cat-1');
  const accessoryProducts = searchResults.filter((p) => p.category_id === 'cat-2');

  // Total Calculations
  const rawEquipmentTotal = cart.reduce((acc, item) => acc + item.product.default_price * item.quantity, 0);
  const totalMonthlyFee = cart.reduce((acc, item) => acc + (item.product.monthly_fee || 0) * item.quantity, 0);

  const markupAmount = (rawEquipmentTotal * (markupPercent || 0)) / 100;
  const subtotalWithMarkup = rawEquipmentTotal + markupAmount;

  const discountAmount = (subtotalWithMarkup * (discountPercent || 0)) / 100;
  const finalEquipmentPrice = Math.max(0, subtotalWithMarkup - discountAmount);

  // Financing simulation — multiple installment options
  const financingResults = financingInstallments.map(n => ({
    n,
    result: calcularSimulacaoFinanciamento(finalEquipmentPrice, 0, 0, n, TAXA_JUROS_MENSAL)
  }));
  // Keep single result for legacy use (first selected or 36x)
  const financingResult = financingResults[0]?.result ?? calcularSimulacaoFinanciamento(finalEquipmentPrice, 0, 0, 36, TAXA_JUROS_MENSAL);

  // Client name for proposal greeting with localStorage persistence
  const [clientName, setClientName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('assistente_show_quote_client_name') || '';
    }
    return '';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_quote_client_name', clientName);
    }
  }, [clientName]);

  const clearCart = () => {
    setCart([]);
    setMarkupPercent(0);
    setDiscountPercent(0);
    setClientName('');
  };

  // Copy WhatsApp proposal message with exact requested template & Benefits
  const generateMessageText = () => {
    const greeting = clientName.trim()
      ? `Olá *${clientName.trim()}*, seu orçamento está pronto!\n\n`
      : `Olá, seu orçamento da *Show Tecnologia / Omnilink* está pronto!\n\n`;

    let msg = greeting;

    msg += `📦 *Equipamentos Selecionados:*\n`;
    cart.forEach((i) => {
      const itemUnitPrice = i.product.default_price * (1 + (markupPercent || 0) / 100);
      const itemTotal = itemUnitPrice * i.quantity;
      msg += `• ${i.quantity}x ${i.product.name} — R$ ${formatCurrency(itemTotal)}\n`;
    });

    if (discountPercent > 0) {
      msg += `\n🏷️ *Desconto Especial (${discountPercent}%):* -R$ ${formatCurrency(discountAmount)}\n`;
    }

    msg += `\n💰 *Total Equipamentos (À Vista):* R$ ${formatCurrency(finalEquipmentPrice)}\n`;

    if (includeMonthlyFee && totalMonthlyFee > 0) {
      msg += `\n📡 *Mensalidade de Serviços:* R$ ${formatCurrency(totalMonthlyFee)}/mês\n`;
    }

    if (requireEntryFee) {
      msg += `\n💵 *Entrada Mínima:* R$ 550,00\n`;
    }

    msg += `\n💳 *Formas de Pagamento:*\n`;

    if (payPix) {
      const pixTotal = finalEquipmentPrice;
      msg += `• *PIX à vista:* R$ ${formatCurrency(pixTotal)}\n`;
    }

    if (payBoleto && boletoInstallments > 0) {
      const boletoVal = finalEquipmentPrice / boletoInstallments;
      msg += `• *Boleto Sem Juros:* ${boletoInstallments}x de R$ ${formatCurrency(boletoVal)}\n`;
    }

    if (payCard && cardInstallments > 0) {
      const cardVal = finalEquipmentPrice / cardInstallments;
      msg += `• *Cartão Sem Juros:* ${cardInstallments}x de R$ ${formatCurrency(cardVal)}\n`;
    }

    if (payFinancing && financingInstallments.length > 0) {
      financingInstallments.forEach(n => {
        const fResult = calcularSimulacaoFinanciamento(finalEquipmentPrice, 0, 0, n, TAXA_JUROS_MENSAL);
        msg += `• *Financiamento ${n}x:* R$ ${formatCurrency(fResult.valorParcela)}/mês\n`;
      });
    }

    msg += `\n✨ *Benefícios Incluídos:*\n`;
    msg += `• Garantia de 12 meses\n`;
    msg += `• Entrega e instalação gratuita\n`;
    msg += `• Treinamento completo para uso dos equipamentos e sistema\n`;

    msg += `\nQualquer dúvida ou ajuste, estou à inteira disposição!`;
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
      {/* Sub-navigation Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setCatalogMode('standard')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold font-outfit transition-all flex items-center justify-center gap-2 ${
            catalogMode === 'standard'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo Padrão</span>
        </button>
        <button
          onClick={() => setCatalogMode('smart')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold font-outfit transition-all flex items-center justify-center gap-2 ${
            catalogMode === 'smart'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Orçamento Inteligente</span>
        </button>
      </div>

      {/* Main Grid + Cart Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column: Products Categorized Sections OR Smart Wizard */}
        <div className="lg:col-span-2 space-y-6">
          {catalogMode === 'smart' ? (
            <SmartQuoteWizard
              products={products}
              onAddItemsToCart={addMultipleItemsToCart}
              onSwitchToStandardCatalog={() => setCatalogMode('standard')}
            />
          ) : (
            <>
              {/* Search & Kit Templates Bar */}
              <div className="clean-card p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                {/* Compact Search Input */}
                <div className="relative w-full md:w-44 shrink-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Scrollable Kit Templates Pills Area */}
                <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 flex-1 py-0.5">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => handleLoadTemplate(tpl)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-medium text-sky-700 dark:text-sky-300 transition-all whitespace-nowrap flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      <span>{tpl.name}</span>
                    </button>
                  ))}
                </div>

                {/* Financing Calculator Button */}
                <button
                  type="button"
                  onClick={() => setShowFinancingCalcModal(true)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-sky-600 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all shrink-0"
                  title="Calculadora de Financiamento"
                >
                  <Calculator className="w-4 h-4" />
                </button>

                {/* Fixed 3 dots button for Kit Management (Pinned at far right) */}
                <button
                  type="button"
                  onClick={() => setShowManageKitsModal(true)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                  title="Gerenciar Kits Prontos"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
          
          {/* Section 1: Rastreadores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Rastreadores Omnilink
              </h3>
              <span className="text-xs text-slate-400">{trackerProducts.length} itens</span>
            </div>

            {trackerProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhum rastreador encontrado para a pesquisa.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {trackerProducts.map((product) => {
                  const inCart = isProductInCart(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`clean-card rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                        inCart ? 'border-sky-500 dark:border-sky-500/60 bg-sky-50/30 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <div 
                        onClick={() => setDetailProduct(product)}
                        className="cursor-pointer group"
                        title="Clique para ver os detalhes do produto"
                      >
                        {/* Image */}
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative mb-2.5 group-hover:opacity-90 transition-opacity">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.monthly_fee && product.monthly_fee > 0 ? (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                              R$ {product.monthly_fee.toFixed(2)}/mês
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-white text-sm font-outfit group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">À Vista</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                            R$ {formatCurrency(product.default_price)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCartItem(product);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Acessórios & Sensores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Acessórios & Sensores
              </h3>
              <span className="text-xs text-slate-400">{accessoryProducts.length} itens</span>
            </div>

            {accessoryProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhum acessório encontrado para a pesquisa.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {accessoryProducts.map((product) => {
                  const inCart = isProductInCart(product.id);
                  return (
                    <div
                      key={product.id}
                      className={`clean-card rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                        inCart ? 'border-sky-500 dark:border-sky-500/60 bg-sky-50/30 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <div 
                        onClick={() => setDetailProduct(product)}
                        className="cursor-pointer group"
                        title="Clique para ver os detalhes do produto"
                      >
                        {/* Image */}
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 relative mb-2.5 group-hover:opacity-90 transition-opacity">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.monthly_fee && product.monthly_fee > 0 ? (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                              R$ {product.monthly_fee.toFixed(2)}/mês
                            </span>
                          ) : null}
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-white text-sm font-outfit group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">À Vista</span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white font-outfit">
                            R$ {formatCurrency(product.default_price)}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCartItem(product);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>

        {/* Right Column: Orçamento */}
        <div className="clean-card p-4 rounded-2xl sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col justify-between shadow-xl">
          {/* Scrollable Inner Body */}
          <div className="overflow-y-auto space-y-3.5 pr-3 flex-1">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm font-outfit">Orçamento</h3>
              </div>
              {cart.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={clearCart}
                    title="Limpar Orçamento"
                    className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar</span>
                  </button>

                  <button
                    onClick={() => setShowSaveTemplateModal(true)}
                    title="Salvar Combinação como Modelo"
                    className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Salvar Kit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Client Name Input for Personalized Greeting */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                placeholder="ex: Carlos (Alfa Logística)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            {/* Products Header Label */}
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 -mb-1">
              Produtos
            </label>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-6 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum produto selecionado.</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Clique em "Adicionar" nos equipamentos ao lado.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] min-h-[160px] overflow-y-auto pr-0.5">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate font-outfit">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        R$ {formatCurrency(item.product.default_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-1.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-1.5 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => toggleCartItem(item.product)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Totals Summary Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Equipamentos (Bruto):</span>
                <span className="font-semibold font-mono">
                  R$ {formatCurrency(rawEquipmentTotal)}
                </span>
              </div>

              {includeMonthlyFee && totalMonthlyFee > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Mensalidades Totais:</span>
                  <span className="font-bold font-mono">
                    R$ {formatCurrency(totalMonthlyFee)}/mês
                  </span>
                </div>
              )}

              {/* Markup % Input */}
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <label className="text-slate-500 dark:text-slate-400 font-medium">Aplicar Acréscimo (%):</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={markupPercent || ''}
                  onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                  className="w-14 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>

              {markupPercent > 0 && (
                <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-semibold pt-0.5">
                  <span>Valor Acréscimo:</span>
                  <span className="font-mono">+ R$ {formatCurrency(markupAmount)}</span>
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
                  <span className="font-mono">- R$ {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                <span>Total Equipamentos:</span>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400 font-outfit">
                  R$ {formatCurrency(finalEquipmentPrice)}
                </span>
              </div>
            </div>

            {/* Formas de Pagamento Options */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider text-[10px]">
                Opções do Orçamento
              </span>

              {/* Mensalidade Toggle */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeMonthlyFee}
                    onChange={(e) => setIncludeMonthlyFee(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <Radio className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Mensalidade de Serviços</span>
                </div>
              </label>

              {/* Entrada Obrigatória Toggle */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={requireEntryFee}
                    onChange={(e) => setRequireEntryFee(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-0"
                  />
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 rounded-sm font-bold">R$</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Exigir Entrada PF Novo</span>
                </div>
                {requireEntryFee && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-400 px-1.5 py-0.5 rounded">R$ 550</span>
                )}
              </label>

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
                    <span className="font-medium text-slate-800 dark:text-slate-200">Cartão Sem Juros</span>
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

              {/* Financiamento (até 36x) */}
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payFinancing}
                      onChange={(e) => setPayFinancing(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0"
                    />
                    <Landmark className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">Financiamento</span>
                  </label>
                </div>

                {payFinancing && (
                  <div className="mt-2 space-y-2">
                    {/* Chips de parcelas */}
                    <div className="flex flex-wrap gap-1.5">
                      {FINANCING_CHIP_OPTIONS.map(n => {
                        const isActive = financingInstallments.includes(n);
                        return (
                          <button
                            key={n}
                            onClick={() => toggleFinancingInstallment(n)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                              isActive
                                ? 'bg-sky-600 text-white border-sky-500 shadow-sm shadow-sky-500/30'
                                : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:text-sky-500'
                            }`}
                          >
                            {n}x
                          </button>
                        );
                      })}
                    </div>

                    {/* Simulações de cada parcela selecionada */}
                    {financingResults.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/60 space-y-1.5">
                        {financingResults.map(({ n, result }) => (
                          <div key={n} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{n}x:</span>
                            <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">
                              R$ {formatCurrency(result.valorParcela)}/mês
                            </span>
                          </div>
                        ))}
                        <div className="text-[9px] text-slate-300 dark:text-slate-600 text-right">Taxa 2,61% a.m. · TAC 3% · IOF</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copy Proposal Action Button - Fixed Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <button
              onClick={handleCopyMessage}
              disabled={cart.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {copiedNotification ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Proposta Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Mensagem WhatsApp</span>
                </>
              )}
            </button>
          </div>
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
                  R$ {formatCurrency(detailProduct.default_price)}
                </span>
              </div>

              {detailProduct.monthly_fee ? (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Mensalidade</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {formatCurrency(detailProduct.monthly_fee)}/mês
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

      {/* Modal: Gerenciar Kits Prontos */}
      {showManageKitsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="clean-card bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-outfit">Gerenciar Kits Prontos</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowManageKitsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {templates.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhum kit pronto cadastrado no momento.</p>
              ) : (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    {editingTemplateId === tpl.id ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editingTemplateName}
                          onChange={(e) => setEditingTemplateName(e.target.value)}
                          className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-sky-500 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingTemplateName.trim() && onUpdateTemplate) {
                              onUpdateTemplate(tpl.id, { name: editingTemplateName.trim() });
                            }
                            setEditingTemplateId(null);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shrink-0"
                          title="Salvar Nome"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTemplateId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-white shrink-0"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate font-outfit">
                            {tpl.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                            {tpl.items.length} {tpl.items.length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Editar Nome */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTemplateId(tpl.id);
                              setEditingTemplateName(tpl.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors"
                            title="Editar Nome do Kit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir Kit */}
                          {deleteConfirmId === tpl.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onDeleteTemplate) onDeleteTemplate(tpl.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg"
                              >
                                Excluir
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(tpl.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Excluir Kit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowManageKitsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Financing Calculator Modal */}
      {showFinancingCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-600/20 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-sky-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit">Simulador de Financiamento</h3>
                  <p className="text-[10px] text-slate-400">Calcule parcelas para qualquer valor</p>
                </div>
              </div>
              <button
                onClick={() => setShowFinancingCalcModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Value Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Valor do Equipamento (R$)</label>
              <input
                type="text"
                placeholder="Ex: 2.500,00"
                value={calcValue}
                onChange={(e) => setCalcValue(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
                autoFocus
              />
            </div>

            {/* Parcelas com +/- */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Parcelas (1x a 36x)</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalcCurrentN(n => Math.max(1, n - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min={1}
                  max={36}
                  value={calcCurrentN}
                  onChange={(e) => {
                    const v = Math.min(36, Math.max(1, parseInt(e.target.value) || 1));
                    setCalcCurrentN(v);
                  }}
                  className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-base text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setCalcCurrentN(n => Math.min(36, n + 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Resultado em tempo real */}
            {calcNumericValue > 0 ? (
              <div className="rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 p-4 text-center">
                <p className="text-[10px] font-semibold text-sky-500 uppercase tracking-wide mb-1">{calcCurrentN}x de</p>
                <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                  R$ {formatCurrency(calcularSimulacaoFinanciamento(calcNumericValue, 0, 0, calcCurrentN, TAXA_JUROS_MENSAL).valorParcela)}
                  <span className="text-sm font-medium text-sky-500">/mês</span>
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-600 mt-2">Taxa 2,61% a.m. · TAC 3% · IOF incluso</p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center">
                <p className="text-xs text-slate-400">Insira um valor para ver a simulação</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
