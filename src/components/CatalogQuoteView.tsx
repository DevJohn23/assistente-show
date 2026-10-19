'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { quoteMessage, quotePreferences, QuoteSnapshot } from '@/lib/quotePresentation';
const ProposalDialog = dynamic(() => import('./proposal/ProposalDialog'), { ssr: false, loading: () => <p role="status">Abrindo proposta…</p> });
import { readQuoteValue, writeQuoteValue, clearLegacyQuote } from '@/lib/quoteStorage';
import { usePendingAction } from '@/lib/usePendingAction';
import { Product, CartItem, QuoteTemplate } from '@/types';
import {
  Search, ShoppingBag, Check, Plus, Minus, Trash2, Copy, Calculator,
  BookmarkPlus, FileText, X, CheckCircle, Layers, Edit3, PanelRightClose, PanelRightOpen,
} from 'lucide-react';
import { QuoteDialog, QuantityControl, ProductImage, UnitPriceInput } from './QuoteControls';

interface CatalogQuoteViewProps {
  userId: string;
  products: Product[];
  templates: QuoteTemplate[];
  onSaveTemplate: (name: string, items: { product_id: string; quantity: number }[]) => Promise<boolean>;
  onUpdateTemplate?: (id: string, updated: Partial<QuoteTemplate>) => Promise<boolean>;
  onDeleteTemplate?: (id: string) => Promise<boolean>;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const CatalogQuoteView: React.FC<CatalogQuoteViewProps> = ({
  userId,
  products,
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
}) => {
  const { isPending, run } = usePendingAction();
  const { user } = useAuth();
  const preferences = quotePreferences(user?.user_metadata?.quote_preferences);
  const [showProposal, setShowProposal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [category, setCategory] = useState('all');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [compactLayout, setCompactLayout] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout>>();
  React.useEffect(() => {
    try { setPanelCollapsed(localStorage.getItem('omnilink_quote_collapsed') === 'true'); } catch { /* Optional preference. */ }
    const media = window.matchMedia('(max-width: 1199px)');
    const sync = () => setCompactLayout(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => { media.removeEventListener('change', sync); clearTimeout(copyTimer.current); };
  }, []);
  const togglePanel = () => {
    setPanelCollapsed(previous => {
      const next = !previous;
      try { localStorage.setItem('omnilink_quote_collapsed', String(next)); } catch { /* Optional preference. */ }
      return next;
    });
  };

  React.useEffect(() => { clearLegacyQuote(); }, []);

  // Cart & Quote state with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = readQuoteValue(userId, 'assistente_show_cart');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  const [markupPercent, setMarkupPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = readQuoteValue(userId, 'assistente_show_quote_markup');
      if (saved) return parseFloat(saved) || 0;
    }
    return 0;
  });

  const [discountPercent, setDiscountPercent] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = readQuoteValue(userId, 'assistente_show_quote_discount');
      if (saved) return parseFloat(saved) || 0;
    }
    return 0;
  });

  // Payment option toggles
  const [includeMonthlyFee, setIncludeMonthlyFee] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = readQuoteValue(userId, 'assistente_show_quote_include_monthly');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [requireEntryFee, setRequireEntryFee] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = readQuoteValue(userId, 'assistente_show_quote_require_entry_fee');
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
      writeQuoteValue(userId, 'assistente_show_cart', JSON.stringify(cart));
    }
  }, [userId, cart]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      writeQuoteValue(userId, 'assistente_show_quote_markup', markupPercent.toString());
    }
  }, [userId, markupPercent]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      writeQuoteValue(userId, 'assistente_show_quote_discount', discountPercent.toString());
    }
  }, [userId, discountPercent]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      writeQuoteValue(userId, 'assistente_show_quote_include_monthly', includeMonthlyFee.toString());
    }
  }, [userId, includeMonthlyFee]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      writeQuoteValue(userId, 'assistente_show_quote_require_entry_fee', requireEntryFee.toString());
    }
  }, [userId, requireEntryFee]);

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
  const [kitError, setKitError] = useState('');

  const [showManageKitsModal, setShowManageKitsModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  // Financing Calculator Modal
  const [showFinancingCalcModal, setShowFinancingCalcModal] = useState(false);
  const [calcValue, setCalcValue] = useState('');
  const [calcCurrentN, setCalcCurrentN] = useState(12);
  const cleanCalcValue = calcValue.replace(/[^0-9,.-]/g, '');
  const groupedCalcValue = /^-?\d{1,3}(?:\.\d{3})+(?:,\d*)?$/.test(cleanCalcValue);
  const normalizedCalcValue = cleanCalcValue.includes(',') || groupedCalcValue
    ? cleanCalcValue.replace(/\./g, '').replace(',', '.') : cleanCalcValue;
  const calcNumericValue = Number(normalizedCalcValue) || 0;

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

  const updateItemCustomPrice = (productId: string, newPrice: number | undefined) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, customPrice: newPrice };
        }
        return item;
      })
    );
  };

  const addToCart = (product: Product) => {
    setCart(previous => {
      const existing = previous.find(item => item.product.id === product.id);
      return existing ? previous.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...previous, { product, quantity: 1 }];
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
  const visibleProducts = searchResults.filter(p => category === 'all' || p.category_id === category);

  // Total Calculations
  const rawEquipmentTotal = cart.reduce((acc, item) => {
    const priceToUse = item.customPrice !== undefined ? item.customPrice : item.product.default_price;
    return acc + priceToUse * item.quantity;
  }, 0);
  const totalMonthlyFee = cart.reduce((acc, item) => acc + (item.product.monthly_fee || 0) * item.quantity, 0);

  const markupAmount = (rawEquipmentTotal * (markupPercent || 0)) / 100;
  const subtotalWithMarkup = rawEquipmentTotal + markupAmount;

  const discountAmount = (subtotalWithMarkup * (discountPercent || 0)) / 100;
  const finalEquipmentPrice = Math.max(0, subtotalWithMarkup - discountAmount);

  const entryDeduction = requireEntryFee ? 550 : 0;
  const balanceAfterEntry = finalEquipmentPrice - entryDeduction;
  const invalidEntry = cart.length > 0 && balanceAfterEntry < 0;
  const quantityTotal = cart.reduce((total, item) => total + item.quantity, 0);

  // Financing simulation — same principal as the copied proposal, including entry.
  const financingResults = financingInstallments.map(n => ({
    n,
    result: calcularSimulacaoFinanciamento(balanceAfterEntry, 0, 0, n, TAXA_JUROS_MENSAL)
  }));
  // Client name for proposal greeting with localStorage persistence
  const [clientName, setClientName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return readQuoteValue(userId, 'assistente_show_quote_client_name') || '';
    }
    return '';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      writeQuoteValue(userId, 'assistente_show_quote_client_name', clientName);
    }
  }, [userId, clientName]);

  const clearCart = () => {
    setCart([]);
    setMarkupPercent(0);
    setDiscountPercent(0);
    setClientName('');
  };

  // Both outputs consume the exact same totals and selected payment conditions.
  const quoteSnapshot: QuoteSnapshot = {
    client: clientName.trim(),
    lines: cart.map(item => {
      const unitPrice = (item.customPrice ?? item.product.default_price) * (1 + (markupPercent || 0) / 100);
      return { id: item.product.id, name: item.product.name, quantity: item.quantity, unitPrice, total: unitPrice * item.quantity };
    }),
    subtotal: subtotalWithMarkup, discountPercent, discount: discountAmount, total: finalEquipmentPrice,
    entry: entryDeduction, balance: balanceAfterEntry, monthly: includeMonthlyFee ? totalMonthlyFee : 0,
    payments: [
      ...(payPix ? [{ label: 'PIX à vista', amount: balanceAfterEntry }] : []),
      ...(payBoleto && boletoInstallments > 0 ? [{ label: 'Boleto Sem Juros', installments: boletoInstallments, amount: balanceAfterEntry / boletoInstallments }] : []),
      ...(payCard && cardInstallments > 0 ? [{ label: 'Cartão Sem Juros', installments: cardInstallments, amount: balanceAfterEntry / cardInstallments }] : []),
    ],
    financing: payFinancing ? financingResults.map(({ n, result }) => ({ label: 'Financiamento', installments: n, amount: result.valorParcela })) : [],
  };
  const generateMessageText = () => quoteMessage(quoteSnapshot, preferences.model);

  const handleCopyMessage = async () => {
    if (cart.length === 0 || invalidEntry || isCopying) return;
    setIsCopying(true); setCopyError(false); setCopiedNotification(false);
    try {
      await navigator.clipboard.writeText(generateMessageText());
      setCopiedNotification(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedNotification(false), 2500);
    } catch { setCopyError(true); }
    finally { setIsCopying(false); }
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

  const handleSaveTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || cart.length === 0) return;
    const saved = await run(() => onSaveTemplate(
      newTemplateName,
      cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
    ));
    if (!saved) { setKitError('Não foi possível salvar o modelo. Verifique a conexão e tente novamente.'); return; }
    setKitError('');
    setNewTemplateName('');
    setShowSaveTemplateModal(false);
  };

  const quoteContent = <>
    <div className="quote-panel-header">
      <div><h2>Seu orçamento</h2><p className="ui-muted text-xs mt-1">{cart.length} {cart.length === 1 ? 'produto' : 'produtos'}</p></div>
      <button className="ui-icon-button" aria-label={compactLayout ? 'Fechar orçamento' : 'Recolher orçamento'} title={compactLayout ? 'Fechar orçamento' : 'Recolher orçamento'}
        onClick={() => compactLayout ? setIsCartSheetOpen(false) : togglePanel()}>{compactLayout ? <X size={18} /> : <PanelRightClose size={18} />}</button>
    </div>
    <div className="quote-panel-body">
      <div className="quote-tools">
        <button className="ui-text-button" title="Salvar Combinação como Modelo" disabled={!cart.length || isPending} onClick={() => { setKitError(''); setShowSaveTemplateModal(true); }}><BookmarkPlus size={16} />Salvar kit</button>
        <button className="ui-text-button quote-clear" disabled={!cart.length || isPending} onClick={() => setConfirmClear(true)}><Trash2 size={15} />Limpar</button>
      </div>
      <label className="quote-field">Cliente<input className="ui-input" placeholder="Digite o nome..." value={clientName} onChange={event => setClientName(event.target.value)} /></label>
      {cart.length === 0 ? <div className="quote-empty"><ShoppingBag size={28} strokeWidth={1.5} /><p>Seu orçamento começa aqui</p><span className="ui-muted text-sm">Adicione produtos pelo catálogo.</span></div>
      : <ul className="quote-items">{cart.map(item => <li key={item.product.id}>
        <div className="quote-item-heading"><strong>{item.product.name}</strong><button className="ui-icon-button quote-remove" aria-label={`Remover ${item.product.name}`} onClick={() => toggleCartItem(item.product)}><Trash2 size={15} /></button></div>
        <div className="quote-item-controls"><UnitPriceInput name={item.product.name} value={item.customPrice ?? item.product.default_price}
          onCommit={value => updateItemCustomPrice(item.product.id, value)} /><QuantityControl name={item.product.name} quantity={item.quantity} onChange={delta => updateQuantity(item.product.id, delta)} /></div>
      </li>)}</ul>}
      <section className="quote-conditions" aria-labelledby="quote-conditions-title"><h3 id="quote-conditions-title">Condições comerciais</h3>
        <div className="quote-adjustments">
          <label className="quote-field">Acréscimo (%)<input className="ui-input" type="number" min="0" step="1" value={markupPercent || ''} placeholder="0" onChange={event => setMarkupPercent(Math.max(0, Number(event.target.value) || 0))} /></label>
          <label className="quote-field">Desconto (%)<input className="ui-input" type="number" min="0" max="100" step="1" value={discountPercent || ''} placeholder="0" onChange={event => setDiscountPercent(Math.min(100, Math.max(0, Number(event.target.value) || 0)))} /></label>
        </div>
        {(markupPercent > 0 || discountPercent > 0) && <dl className="quote-adjustment-summary">
          <div><dt>Subtotal</dt><dd>R$ {formatCurrency(rawEquipmentTotal)}</dd></div>
          {markupPercent > 0 && <div><dt>Acréscimo ({markupPercent}%)</dt><dd>+ R$ {formatCurrency(markupAmount)}</dd></div>}
          {discountPercent > 0 && <div><dt>Desconto ({discountPercent}%)</dt><dd>− R$ {formatCurrency(discountAmount)}</dd></div>}
        </dl>}
      </section>
      <fieldset className="quote-options"><legend>Incluir na proposta</legend>
        <label><input type="checkbox" checked={includeMonthlyFee} onChange={event => setIncludeMonthlyFee(event.target.checked)} />Mensalidade</label>
        <label><input type="checkbox" checked={requireEntryFee} onChange={event => setRequireEntryFee(event.target.checked)} />Entrada <span className="ui-muted ml-auto text-xs">R$ 550,00</span></label>
        <label><input type="checkbox" checked={payPix} onChange={event => setPayPix(event.target.checked)} />Pix à vista</label>
        <div className="quote-option-row"><label><input type="checkbox" checked={payBoleto} onChange={event => setPayBoleto(event.target.checked)} />Boleto sem juros</label>
          {payBoleto && <select aria-label="Parcelas no boleto" className="ui-input" value={boletoInstallments} onChange={event => setBoletoInstallments(Number(event.target.value))}>{[1,2,3].map(n => <option key={n} value={n}>{n}x</option>)}</select>}</div>
        <div className="quote-option-row"><label><input type="checkbox" checked={payCard} onChange={event => setPayCard(event.target.checked)} />Cartão sem juros</label>
          {payCard && <select aria-label="Parcelas no cartão" className="ui-input" value={cardInstallments} onChange={event => setCardInstallments(Number(event.target.value))}>{Array.from({length:12},(_,i) => i+1).map(n => <option key={n} value={n}>{n}x</option>)}</select>}</div>
        <label><input type="checkbox" checked={payFinancing} onChange={event => setPayFinancing(event.target.checked)} />Financiamento</label>
        {payFinancing && <div className="quote-financing"><div className="quote-installments" role="group" aria-label="Parcelas do financiamento">{FINANCING_CHIP_OPTIONS.map(n =>
          <button className="quote-chip" key={n} aria-pressed={financingInstallments.includes(n)} onClick={() => toggleFinancingInstallment(n)}>{n}x</button>)}</div>
          {financingResults.map(({n,result}) => <div className="quote-financing-result" key={n}><span>{n}x de</span><strong>R$ {formatCurrency(result.valorParcela)}/mês</strong></div>)}
          {financingInstallments.length === 0 && <p className="ui-muted text-xs">Selecione as parcelas para incluir o financiamento.</p>}
          <p className="ui-muted text-xs mt-2">TAC e IOF incluídos na simulação.</p>
        </div>}
      </fieldset>
    </div>
    <footer className="quote-panel-footer">
      <dl className="quote-totals"><div><dt>Equipamentos</dt><dd data-testid="quote-equipment-total">R$ {formatCurrency(finalEquipmentPrice)}</dd></div>
        {includeMonthlyFee && totalMonthlyFee > 0 && <div><dt>Mensalidade</dt><dd>R$ {formatCurrency(totalMonthlyFee)}/mês</dd></div>}
        {requireEntryFee && cart.length > 0 && <><div className="quote-entry"><dt>Entrada</dt><dd>R$ 550,00</dd></div><div><dt>Saldo após entrada</dt><dd>R$ {formatCurrency(Math.max(0,balanceAfterEntry))}</dd></div></>}
      </dl>
      {invalidEntry && <p className="quote-error" role="alert">A entrada supera o total dos equipamentos. Ajuste o orçamento ou desmarque a entrada.</p>}
      {copyError && <p className="quote-error" role="alert">Não foi possível copiar. Verifique a permissão de cópia do navegador e tente novamente.</p>}
      <button className="ui-button ui-button-primary w-full" disabled={!cart.length || invalidEntry || isCopying} onClick={handleCopyMessage}>
        {copiedNotification ? <CheckCircle size={17} /> : <Copy size={17} />}{copiedNotification ? 'Mensagem copiada' : isCopying ? 'Copiando…' : 'Copiar mensagem'}</button>
      {preferences.pdfEnabled && <button className="ui-button ui-button-secondary w-full mt-2" disabled={!cart.length || invalidEntry} onClick={() => setShowProposal(true)}><FileText size={17} />Gerar proposta PDF</button>}
      <span className="sr-only" role="status">{copiedNotification ? 'Mensagem copiada para a área de transferência.' : ''}</span>
    </footer>
  </>;

  return <div className={`catalog-view ${!compactLayout && !panelCollapsed ? 'catalog-panel-expanded' : ''}`}>
    <h1 className="sr-only">Orçamentos</h1>
    {showProposal && preferences.pdfEnabled && <ProposalDialog quote={quoteSnapshot} seller={user?.user_metadata?.full_name || ''} contact={user?.email || ''} onClose={() => setShowProposal(false)} />}
    {(panelCollapsed || compactLayout) && <button className="quote-collapsed-bar" onClick={() => compactLayout ? setIsCartSheetOpen(true) : togglePanel()} aria-label="Abrir orçamento">
      <span className="flex items-center gap-2"><PanelRightOpen size={18} /><strong>Abrir orçamento</strong><span className="ui-muted">{quantityTotal} {quantityTotal === 1 ? 'item' : 'itens'}</span></span><strong>R$ {formatCurrency(finalEquipmentPrice)}</strong></button>}
    <div className={`catalog-workspace ${panelCollapsed || compactLayout ? 'catalog-workspace-wide' : ''}`}>
      <section className="catalog-products" aria-label="Catálogo de produtos">
        <div className="catalog-toolbar"><div className="catalog-search"><Search size={18} /><input aria-label="Buscar produto" placeholder="Buscar produto..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
          {searchTerm && <button className="ui-icon-button" aria-label="Limpar busca" onClick={() => setSearchTerm('')}><X size={16} /></button>}</div>
          <button className="ui-button ui-button-secondary catalog-financing-button" title="Calculadora de Financiamento" onClick={() => setShowFinancingCalcModal(true)}><Calculator size={17} />Simular financiamento</button>
        </div>
        <div className="catalog-filters"><div role="group" aria-label="Categoria de produtos">{[{id:'all',label:'Todos'},{id:'cat-1',label:'Rastreadores'},{id:'cat-2',label:'Acessórios'}].map(item =>
          <button className="quote-chip" key={item.id} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
          <button className="ui-button ui-button-secondary" title="Gerenciar Kits Prontos" onClick={() => { setKitError(''); setShowManageKitsModal(true); }}><Layers size={16} />Kits salvos</button></div>
        {templates.length > 0 && <div className="catalog-kits" aria-label="Usar kit salvo">{templates.map(tpl => <button className="quote-chip" key={tpl.id} onClick={() => handleLoadTemplate(tpl)}><Layers size={14} />{tpl.name}</button>)}</div>}
        <p className="ui-muted text-xs mb-3">{visibleProducts.length} {visibleProducts.length === 1 ? 'produto' : 'produtos'}</p>
        {visibleProducts.length === 0 ? <div className="ui-panel quote-empty"><Search size={28} /><p>Nenhum produto encontrado</p>
          {(searchTerm || category !== 'all') && <button className="ui-text-button" onClick={() => { setSearchTerm(''); setCategory('all'); }}>Limpar filtros</button>}</div>
        : <div className="catalog-product-grid">{visibleProducts.map(product => {
          const selected = cart.find(item => item.product.id === product.id);
          return <article key={product.id} className={`catalog-product ${selected ? 'is-selected' : ''}`}>
            <button className="catalog-product-image" onClick={() => setDetailProduct(product)} aria-label={`Ver detalhes de ${product.name}`}><ProductImage src={product.image_url} name={product.name} /></button>
            <div className="catalog-product-info"><button className="catalog-product-name" onClick={() => setDetailProduct(product)}>{product.name}</button>
              <div className="catalog-product-price"><strong>R$ {formatCurrency(product.default_price)}</strong>{!!product.monthly_fee && product.monthly_fee > 0 && <span className="catalog-monthly-fee">R$ {formatCurrency(product.monthly_fee)}/mês</span>}</div>
              <button type="button" className={`ui-button ui-button-secondary catalog-add-button ${selected ? 'is-added' : ''}`} aria-disabled={!!selected} onClick={() => { if (!selected) addToCart(product); }}>
                <span key={selected ? 'added' : 'add'} className="catalog-add-label">{selected ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}{selected ? 'Adicionado' : 'Adicionar'}</span>
              </button>
            </div>
          </article>;
        })}</div>}
      </section>
      {!compactLayout && !panelCollapsed && <aside className="quote-panel ui-panel" aria-label="Composição do orçamento">{quoteContent}</aside>}
    </div>
    {compactLayout && isCartSheetOpen && <QuoteDialog fullScreen label="Composição do orçamento" onClose={() => setIsCartSheetOpen(false)}>{quoteContent}</QuoteDialog>}
    {confirmClear && <QuoteDialog label="Limpar orçamento" onClose={() => setConfirmClear(false)}><div className="quote-preview"><h2>Limpar orçamento?</h2><p className="ui-muted my-4">Os produtos, o cliente e os ajustes de preço serão removidos deste orçamento. Seus kits salvos serão mantidos.</p><div className="flex justify-end gap-2"><button className="ui-button ui-button-secondary" onClick={() => setConfirmClear(false)}>Cancelar</button><button className="ui-button ui-button-primary" onClick={() => { clearCart(); setConfirmClear(false); }}>Limpar orçamento</button></div></div></QuoteDialog>}
      {detailProduct && <QuoteDialog label="Detalhes do produto" onClose={() => setDetailProduct(null)}>
        <div className="quote-preview product-detail">
          <header className="quote-modal-heading"><div><span className="ui-muted">Catálogo de produtos</span><h2>{detailProduct.name}</h2></div><button className="ui-icon-button" aria-label="Fechar detalhes do produto" onClick={() => setDetailProduct(null)}><X size={20} /></button></header>
          <div className="product-detail-image"><ProductImage src={detailProduct.image_url} name={detailProduct.name} /></div>
          <p className="product-detail-description">{detailProduct.description}</p>
          <div className="product-detail-prices"><div><span>Equipamento à vista</span><strong>R$ {formatCurrency(detailProduct.default_price)}</strong></div>{!!detailProduct.monthly_fee && <div><span>Mensalidade</span><strong>R$ {formatCurrency(detailProduct.monthly_fee)}<small>/mês</small></strong></div>}</div>
          <footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" onClick={() => setDetailProduct(null)}>Fechar</button><button className="ui-button ui-button-primary" onClick={() => { addToCart(detailProduct); setDetailProduct(null); }}><Plus size={17} />Adicionar ao Orçamento</button></footer>
        </div>
      </QuoteDialog>}

      {/* Save Template Modal */}
      {showSaveTemplateModal && (
        <QuoteDialog label="Salvar kit" onClose={() => setShowSaveTemplateModal(false)} canClose={!isPending}>
          <div className="quote-legacy-modal">
            <button
              disabled={isPending}
              aria-label="Fechar salvar kit" onClick={() => setShowSaveTemplateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-outfit">Salvar Combinação de Orçamento</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Crie um Kit padrão para reutilizar esta combinação de produtos em futuros atendimentos.
            </p>

            <form onSubmit={handleSaveTemplateSubmit} className="space-y-3">
              {kitError && <p role="alert" className="quote-error">{kitError}</p>}
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
                  disabled={isPending}
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                >
                  Salvar Kit
                </button>
              </div>
            </form>
          </div>
        </QuoteDialog>
      )}

      {/* Modal: Gerenciar Kits Prontos */}
      {showManageKitsModal && (
        <QuoteDialog label="Kits salvos" onClose={() => setShowManageKitsModal(false)} canClose={!isPending}>
          <div className="quote-legacy-modal">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-outfit">Gerenciar Kits Prontos</h3>
              </div>
              <button
                type="button"
                disabled={isPending}
                aria-label="Fechar kits salvos" onClick={() => setShowManageKitsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {kitError && <p role="alert" className="quote-error">{kitError}</p>}
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
                          aria-label="Nome do kit" value={editingTemplateName}
                          onChange={(e) => setEditingTemplateName(e.target.value)}
                          className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-sky-500 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={async () => {
                            if (editingTemplateName.trim() && onUpdateTemplate) {
                              const saved = await run(() => onUpdateTemplate(tpl.id, { name: editingTemplateName.trim() }));
                              if (saved) { setEditingTemplateId(null); setKitError(''); }
                              else setKitError('Não foi possível atualizar o kit. Tente novamente.');
                            }
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
                                disabled={isPending}
                                onClick={async () => {
                                  if (onDeleteTemplate && await run(() => onDeleteTemplate(tpl.id))) { setDeleteConfirmId(null); setKitError(''); }
                                  else setKitError('Não foi possível excluir o kit. Tente novamente.');
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
                disabled={isPending}
                onClick={() => setShowManageKitsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Concluir
              </button>
            </div>
          </div>
        </QuoteDialog>
      )}
      {showFinancingCalcModal && <QuoteDialog label="Simulador de financiamento" onClose={() => setShowFinancingCalcModal(false)}>
        <div className="quote-preview financing-dialog">
          <header className="quote-modal-heading"><div><h2>Simulador de financiamento</h2><p className="ui-muted">Calcule parcelas para qualquer valor.</p></div><button className="ui-icon-button" aria-label="Fechar simulador de financiamento" onClick={() => setShowFinancingCalcModal(false)}><X size={20} /></button></header>
          <label className="quote-field">Valor do equipamento (R$)<input className="ui-input" type="text" inputMode="decimal" aria-label="Valor do equipamento para simulação" placeholder="Ex: 2.500,00" value={calcValue} onChange={e => setCalcValue(e.target.value)} autoFocus /></label>
          <label className="quote-field">Parcelas (1x a 36x)<div className="financing-installments"><button className="ui-icon-button" aria-label="Diminuir parcelas" disabled={calcCurrentN <= 1} onClick={() => setCalcCurrentN(n => Math.max(1, n - 1))}><Minus size={18} /></button><input className="ui-input" type="number" aria-label="Parcelas da simulação" min={1} max={36} step={1} value={calcCurrentN} onChange={e => setCalcCurrentN(Math.min(36, Math.max(1, parseInt(e.target.value) || 1)))} /><button className="ui-icon-button" aria-label="Aumentar parcelas" disabled={calcCurrentN >= 36} onClick={() => setCalcCurrentN(n => Math.min(36, n + 1))}><Plus size={18} /></button></div></label>
          <div className="financing-result" aria-live="polite">{calcNumericValue > 0 ? <><span>{calcCurrentN}x de</span><strong>R$ {formatCurrency(calcularSimulacaoFinanciamento(calcNumericValue, 0, 0, calcCurrentN, TAXA_JUROS_MENSAL).valorParcela)}<small>/mês</small></strong><p>Taxa 2,61% a.m. · TAC 3% · IOF incluso</p></> : <p>Insira um valor para ver a simulação</p>}</div>
          <footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" onClick={() => setShowFinancingCalcModal(false)}>Fechar</button></footer>
        </div>
      </QuoteDialog>}

  </div>;
};
