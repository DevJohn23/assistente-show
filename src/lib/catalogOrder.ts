// Stable product identities keep merchandising order independent of edits and DB row order.
const featuredIds = ['prod-1', 'prod-2'];
const ids = new Intl.Collator('pt-BR', { numeric: true });
export function orderCatalogProducts<T extends { id: string }>(products: readonly T[]): T[] {
  const priority = (id: string) => {
    const index = featuredIds.indexOf(id);
    return index < 0 ? featuredIds.length : index;
  };
  return [...products].sort((a, b) => priority(a.id) - priority(b.id)
    || ids.compare(a.id, b.id) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}
