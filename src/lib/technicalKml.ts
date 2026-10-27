export interface ImportedTechnician {
  nome: string; categoria: string; tipo: string; descricao: string;
  telefone: string; email: string; lat: number; lng: number; vendedor_parceiro: string;
}
export const MAX_KML_BYTES = 5 * 1024 * 1024;
const descendants = (el: Document | Element, tag: string) => Array.from(el.getElementsByTagNameNS('*', tag));
const childText = (el: Element, tag: string) => Array.from(el.children).find(c => c.localName === tag)?.textContent?.trim() || '';
// DOMParser parses inert XML. Never mount markup or follow NetworkLink URLs from uploads.
export function parseTechnicalKml(source: string): { name: string; rows: ImportedTechnician[]; warnings: string[] } {
  if (new TextEncoder().encode(source).length > MAX_KML_BYTES) throw new Error('O arquivo deve ter até 5 MB.');
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) throw new Error('KML com entidades externas não é aceito.');
  const doc = new DOMParser().parseFromString(source, 'application/xml');
  if (descendants(doc, 'parsererror').length || doc.documentElement.localName !== 'kml') throw new Error('Arquivo KML inválido. Exporte novamente o mapa completo.');
  if (descendants(doc, 'NetworkLink').length) throw new Error('Este arquivo contém um link, não os técnicos. Exporte o mapa completo sem a opção de link de rede.');
  const points = descendants(doc, 'Placemark');
  if (!points.length || points.length > 5000) throw new Error('O KML precisa conter entre 1 e 5.000 técnicos.');
  const names = new Set<string>();
  const warnings: string[] = [];
  const rows = points.map((point, index): ImportedTechnician => {
    const nome = childText(point, 'name');
    const key = nome.toLowerCase().trim();
    if (!nome || nome.length > 300) throw new Error(`Ponto ${index + 1}: nome ausente ou muito longo.`);
    if (names.has(key)) throw new Error(`Nome duplicado no arquivo: ${nome}. Corrija antes de importar.`);
    names.add(key);
    const geometries = descendants(point, 'Point');
    if (geometries.length !== 1 || descendants(point, 'LineString').length || descendants(point, 'Polygon').length) throw new Error(`${nome}: esperado um único ponto de localização, sem rotas ou áreas.`);
    const coordinateText = childText(geometries[0], 'coordinates');
    const coordinates = coordinateText.split(',');
    if (!/^[+-]?[\d.]+\s*,\s*[+-]?[\d.]+(?:\s*,\s*[+-]?[\d.]+)?$/.test(coordinateText)) throw new Error(`${nome}: coordenadas inválidas.`);
    const [lng, lat] = coordinates.map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error(`${nome}: coordenadas fora do intervalo permitido.`);
    // Descriptions in My Maps may be HTML inside CDATA. Keep plain text only.
    const raw = childText(point, 'description');
    const descricao = raw.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
    if (descricao.length > 10000) throw new Error(`${nome}: descrição muito longa.`);
    let folder = point.parentElement;
    while (folder && folder.localName !== 'Folder') folder = folder.parentElement;
    const category = `${folder ? childText(folder, 'name') : ''} ${nome}`.toUpperCase();
    const categoria = /REDE\s+PLUS|\bPRP_/.test(category) ? 'REDE PLUS' : /\bPSO(?:_|\b)/.test(category) ? (/ESTOQUE/.test(category + descricao.toUpperCase()) ? 'PSO C/ESTOQUE AVANÇADO' : 'PSO') : /\bATA(?:\d+)?(?:_|\b)/.test(category) ? 'ATA' : /\bSPOT(?:_|\b)/.test(category) ? 'SPOT' : 'OUTROS';
    const tipo = /\bfixo\b|\bFX\b/i.test(descricao) ? 'Fixo' : /\bvolante\b/i.test(descricao) ? 'Volante' : '';
    const telefone = descricao.match(/(?:\+?55\s*)?\(?\d{2}\)?\s*\d{4,5}[\s-]?\d{4}/)?.[0] || '';
    const email = descricao.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || '';
    const vendedor_parceiro = descricao.match(/(?:Supervisor|Parceiro):\s*([^\n]+)/i)?.[1]?.trim() || '';
    if (!telefone) warnings.push(`${nome}: telefone não identificado; confira a descrição.`);
    if (categoria === 'OUTROS') warnings.push(`${nome}: categoria não reconhecida.`);
    return {nome, categoria, tipo, descricao, telefone, email, lat, lng, vendedor_parceiro};
  });
  return {name: childText(descendants(doc, 'Document')[0] || doc.documentElement, 'name'), rows, warnings};
}
