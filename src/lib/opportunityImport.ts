import type { ClientType, Opportunity } from '@/types';

export const OPPORTUNITY_SOURCE = 'crm_csv_v1';
export const IMPORT_LIMIT = 2000;
export type ImportRow = { key: number; external_id: string; client_name: string; registration_date: string; error?: string };
export type ImportItem = { external_id: string; client_name: string; registration_date: string; type: ClientType; action: 'insert' | 'update'; expected?: ReturnType<typeof opportunitySnapshot>; recalculate_expiration?: boolean };
export type ImportResult = { inserted: number; updated: number; skipped: number };
export function opportunitySnapshot(o: Opportunity) {
  return { client_name:o.client_name, registration_date:o.registration_date, expiration_date:o.expiration_date, type:o.type, source_name:o.source_name ?? null, source_registration_date:o.source_registration_date ?? null };
}
export function expirationFor(date: string, type: ClientType) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (type === 'PJ' ? 30 : 15));
  return d.toISOString().slice(0,10);
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number(value.slice(0,4)) >= 1900 && Number(value.slice(0,4)) <= 9998 && !Number.isNaN(Date.parse(value)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
}
export const normalizeName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
// RFC 4180-style parsing: quoted commas, escaped quotes, CRLF and multiline fields.
export function parseOpportunityCSV(input: string): ImportRow[] {
  const text = input.replace(/^\uFEFF/,'');
  const delimiter = text.split(/\r?\n/,1)[0].includes(';') ? ';' : ',';
  const records: string[][] = []; let row: string[] = [], field = '', quoted = false, closed = false;
  for (let i=0;i<text.length;i++) {
    const ch=text[i];
    if (quoted) {
      if (ch==='"' && text[i+1]==='"') { field+='"';i++; }
      else if (ch==='"') { quoted=false;closed=true; }
      else field+=ch;
    } else if (ch==='"' && !field && !closed) quoted=true;
    else if(ch===delimiter || ch==='\n' || ch==='\r') {
      row.push(field);field='';closed=false;
      if(ch!==delimiter) { if(row.some(v=>v.trim())) records.push(row);row=[];if(ch==='\r' && text[i+1]==='\n') i++; }
    } else {
      if(closed || ch==='"') throw new Error('CSV inválido: verifique as aspas do arquivo.');
      field+=ch;
    }
    if(records.length>IMPORT_LIMIT+1) throw new Error(`Importe até ${IMPORT_LIMIT} oportunidades por arquivo.`);
  }
  if(quoted) throw new Error('CSV incompleto: há um campo com aspas não fechadas.');
  row.push(field);if(row.some(v=>v.trim())) records.push(row);
  const headers=(records.shift() || []).map(v=>normalizeName(v));
  const id=headers.indexOf('id'),name=headers.indexOf('nome do cliente'),date=headers.indexOf('data cadastro');
  if([id,name,date].some(i=>i<0) || new Set(headers).size!==headers.length) throw new Error('O CSV deve conter as colunas ID, Nome do Cliente e Data Cadastro, sem cabeçalhos repetidos.');
  if(!records.length) throw new Error('O arquivo não contém oportunidades.');
  if(records.length>IMPORT_LIMIT) throw new Error(`Importe até ${IMPORT_LIMIT} oportunidades por arquivo.`);
  const counts=new Map<string,number>();
  records.forEach(r=>counts.set(r[id]?.trim(),(counts.get(r[id]?.trim()) || 0)+1));
  return records.map((r,index)=>{
    const external_id=(r[id] || '').trim(), client_name=(r[name] || '').trim();
    const raw=(r[date] || '').trim();
    const match=raw.match(/^(\d{4}-\d{2}-\d{2})(?: \d{2}:\d{2}:\d{2})?$/);
    const registration_date=match?.[1] || '';
    let error: string | undefined;
    if(r.length!==headers.length) error='Quantidade de colunas inválida';
    else if(!/^\d{1,64}$/.test(external_id)) error='ID ausente ou inválido';
    else if(counts.get(external_id)!>1) error='ID repetido neste arquivo';
    else if(!client_name || client_name.length>300) error='Nome ausente ou muito longo';
    else if(!validDate(registration_date)) error='Data de cadastro inválida';
    return {key:index,external_id,client_name,registration_date,error};
  });
}
export function classifyImport(row: ImportRow, opportunities: Opportunity[]) {
  const existing=opportunities.find(o=>o.source_system===OPPORTUNITY_SOURCE && o.external_id===row.external_id);
  if(row.error) return {kind:'invalid' as const,existing};
  if(!existing) return {kind:'new' as const,existing};
  return {kind:existing.source_name===row.client_name && existing.source_registration_date===row.registration_date ? 'same' as const : 'changed' as const,existing};
}
export type OpportunityOrder = 'expiration' | 'registration' | 'imported' | 'name';
export function sortOpportunities(rows: Opportunity[], order: OpportunityOrder) {
  return [...rows].sort((a,b)=>{
    const result=order==='name' ? a.client_name.localeCompare(b.client_name,'pt-BR') : order==='registration' ? (b.registration_date || '').localeCompare(a.registration_date || '') : order==='imported' ? (b.imported_at || '').localeCompare(a.imported_at || '') : a.expiration_date.localeCompare(b.expiration_date);
    return result || a.client_name.localeCompare(b.client_name,'pt-BR') || a.id.localeCompare(b.id);
  });
}
