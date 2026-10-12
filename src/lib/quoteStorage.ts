// Legacy drafts have no reliable owner and must never be assigned to a new login.
const legacyKeys = [
  'assistente_show_cart', 'assistente_show_quote_markup', 'assistente_show_quote_discount',
  'assistente_show_quote_include_monthly', 'assistente_show_quote_require_entry_fee',
  'assistente_show_quote_client_name',
];

export function clearLegacyQuote() {
  try { legacyKeys.forEach(key => localStorage.removeItem(key)); } catch { /* Storage is optional. */ }
}

export function readQuoteValue(userId: string, key: string): string | null {
  if (!userId) return null;
  try { return localStorage.getItem(`omnilink:quote:v1:${userId}:${key}`); } catch { return null; }
}

export function writeQuoteValue(userId: string, key: string, value: string) {
  if (!userId) return;
  try { localStorage.setItem(`omnilink:quote:v1:${userId}:${key}`, value); } catch { /* Keep the current draft in memory. */ }
}
