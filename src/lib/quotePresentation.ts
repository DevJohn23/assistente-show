export type QuoteModel = 'basic' | 'detailed' | 'formal';
export interface QuotePreferences { model: QuoteModel; pdfEnabled: boolean; showItemPrices: boolean }
export function quotePreferences(value: unknown): QuotePreferences {
  const v = value as Partial<QuotePreferences> | null;
  return { model: v?.model === 'detailed' || v?.model === 'formal' ? v.model : 'basic', pdfEnabled: v?.pdfEnabled === true, showItemPrices: v?.showItemPrices === true };
}
export interface QuoteLine { id: string; name: string; quantity: number; unitPrice: number; total: number }
export interface QuotePayment { label: string; installments?: number; amount: number }
export interface QuoteSnapshot {
  client: string; lines: QuoteLine[]; subtotal: number; discountPercent: number; discount: number;
  total: number; entry: number; balance: number; monthly: number;
  payments: QuotePayment[]; financing: QuotePayment[];
}
export const quoteBenefits = ['Garantia de 12 meses', 'Entrega e instalação gratuita', 'Treinamento completo para uso dos equipamentos e sistema'];
export const money = (value: number) => value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Stable IDs identify the complete kits; do not match accessories or "sem teclado" variants by substring.
export function cabinKit(id: string): string[] {
  if (id !== 'prod-1' && id !== 'prod-2') return [];
  return ['Módulo com dois chips', ...(id === 'prod-1' ? ['Antena satélite'] : []), 'Teclado', 'Botão de pânico', 'Sensor de painel', 'Sensor na porta carona e motorista', 'Bloqueador', 'Sirene'];
}
export function quoteMessage(q: QuoteSnapshot, model: QuoteModel = 'basic', showItemPrices = false) {
  const formal = model === 'formal';
  const title = (emoji: string, text: string) => `${formal ? '' : emoji + ' '}*${text}*`;
  let text = formal ? '*ORÇAMENTO COMERCIAL*\n' + (q.client.trim() ? `Cliente: ${q.client.trim()}\n` : '') + '\n'
    : q.client.trim() ? `Olá *${q.client.trim()}*, seu orçamento está pronto!\n\n` : '';
  text += title('📦', 'Equipamentos Selecionados:') + '\n';
  q.lines.forEach(line => { text += `• ${line.quantity}x ${line.name}${showItemPrices ? ` — R$ ${money(line.total)}` : ''}\n`; });
  if (model === 'detailed') {
    const seen = new Set<string>();
    for (const line of q.lines) {
      const kit = cabinKit(line.id);
      if (!kit.length || seen.has(line.id)) continue;
      seen.add(line.id);
      text += `\n✅ *O kit ${line.id === 'prod-1' ? 'Omniturbo' : 'Omnidual'} contempla:*\n${kit.map(part => '• ' + part).join('\n')}\n`;
    }
  }
  if (q.discountPercent > 0) text += '\n' + title('🏷️', `Desconto Especial (${q.discountPercent}%):`) + ` -R$ ${money(q.discount)}\n`;
  if (q.entry) text += '\n' + title('💵', 'Entrada Mínima:') + ` R$ ${money(q.entry)}\n`;
  text += '\n' + title('💰', 'Total Equipamentos (À Vista):') + ` R$ ${money(q.total)}\n`;
  if (q.entry) text += `Saldo após entrada: R$ ${money(q.balance)}\n`;
  if (q.monthly > 0) text += '\n' + title('📡', 'Mensalidade:') + ` R$ ${money(q.monthly)}/mês\n`;
  if (q.payments.length) {
    text += '\n' + title('💳', 'Formas de Pagamento:') + '\n';
    q.payments.forEach(p => { text += `• *${p.label}:* ${p.installments ? `${p.installments}x de ` : ''}R$ ${money(p.amount)}\n`; });
  }
  if (q.financing.length) {
    text += '\n*Financiamento:*\n';
    q.financing.forEach(p => { text += `• ${p.installments}x de R$ ${money(p.amount)}/mês\n`; });
  }
  text += '\n' + title('✨', 'Benefícios Incluídos:') + '\n' + quoteBenefits.map(b => '• ' + b).join('\n') + '\n';
  return text;
}
export const quoteModelLabels: Record<QuoteModel, string> = { basic: 'Básico', detailed: 'Detalhado', formal: 'Sóbrio' };
