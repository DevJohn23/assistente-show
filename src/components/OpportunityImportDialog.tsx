'use client';
import { useRef, useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import type { ClientType, Opportunity } from '@/types';
import { QuoteDialog } from './QuoteControls';
import { classifyImport, expirationFor, normalizeName, opportunitySnapshot, parseOpportunityCSV, type ImportItem, type ImportResult, type ImportRow } from '@/lib/opportunityImport';

type Choice = { selected:boolean; type:ClientType; recalculate:boolean };
const dateLabel=(d:string)=>d ? d.split('-').reverse().join('/') : '—';
export function OpportunityImportDialog({ opportunities, onClose, onImport }: { opportunities:Opportunity[]; onClose:()=>void; onImport:(items:ImportItem[])=>Promise<ImportResult> }) {
  const [rows,setRows]=useState<ImportRow[]>([]), [choices,setChoices]=useState<Record<number,Choice>>({});
  const [clientType,setClientType]=useState<ClientType>('PJ'), [updates,setUpdates]=useState(false);
  const [fileName,setFileName]=useState(''), [error,setError]=useState(''), [busy,setBusy]=useState(false), [reading,setReading]=useState(false);
  const [result,setResult]=useState<ImportResult|null>(null), [page,setPage]=useState(1);
  const locked=useRef(false), fileSequence=useRef(0);
  const classified=rows.map(row=>({row,...classifyImport(row,opportunities)}));
  const counts={new:0,same:0,changed:0,invalid:0};classified.forEach(r=>counts[r.kind]++);
  const eligible=(kind:string)=>kind==='new' || (updates && kind==='changed');
  const selected=classified.filter(({row,kind})=>eligible(kind) && choices[row.key]?.selected);
  const patch=(key:number,update:Partial<Choice>)=>setChoices(prev=>({...prev,[key]:{...prev[key],...update}}));
  async function readFile(file?:File) {
    const sequence=++fileSequence.current;
    setError('');setRows([]);setChoices({});setResult(null);setPage(1);setFileName(file?.name || '');setUpdates(false);
    if(!file) return;
    if(!/\.csv$/i.test(file.name) || file.size>2*1024*1024) { setError('Selecione um arquivo CSV de até 2 MB.');return; }
    setReading(true);
    try {
      const bytes=await file.arrayBuffer();let text:string;
      try {text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);} catch {text=new TextDecoder('windows-1252').decode(bytes);}
      const parsed=parseOpportunityCSV(text);
      if(sequence!==fileSequence.current) return;
      setRows(parsed);setChoices(Object.fromEntries(parsed.map(row=>{
        const {kind,existing}=classifyImport(row,opportunities);
        return [row.key,{selected:kind==='new',type:existing?.type || clientType,recalculate:false}];
      })));
    } catch(e) { if(sequence===fileSequence.current) setError(e instanceof Error?e.message:'Não foi possível ler o arquivo.'); }
    finally {if(sequence===fileSequence.current) setReading(false);}
  }
  async function confirm() {
    if(locked.current || !selected.length) return;
    locked.current=true;setBusy(true);setError('');
    const items:ImportItem[]=selected.map(({row,kind,existing})=>({external_id:row.external_id,client_name:row.client_name,registration_date:row.registration_date,type:choices[row.key].type,action:kind==='new'?'insert':'update',...(existing?{expected:opportunitySnapshot(existing),recalculate_expiration:choices[row.key].recalculate}:{})}));
    try {setResult(await onImport(items));} catch(e) {setError(e instanceof Error?e.message:'Não foi possível importar. Tente novamente.');}
    finally {locked.current=false;setBusy(false);}
  }
  return <QuoteDialog className="opportunity-import-dialog" label="Importar oportunidades" onClose={onClose} canClose={!busy && !reading}>
    <header className="commission-editor-header"><div><h2>Importar oportunidades</h2><p className="ui-muted">Traga sua carteira e confira os prazos antes de salvar.</p></div><button className="ui-icon-button" aria-label="Fechar importação" disabled={busy || reading} onClick={onClose}><X size={20}/></button></header>
    <div className="opportunity-import-body">
      {result ? <div className="opportunity-import-success" role="status"><CheckCircle2 size={36}/><h3>Importação concluída</h3><p>{result.inserted} novas · {result.updated} atualizadas · {result.skipped} já existentes</p><p className="ui-muted">Os contatos e as observações existentes foram preservados.</p></div> : <>
      <fieldset disabled={busy || reading} className="opportunity-import-controls">
        <label className="opportunity-file-picker"><FileSpreadsheet size={26}/><strong>{fileName || 'Selecionar arquivo CSV'}</strong><span className="ui-muted">Até 2 MB · 2.000 oportunidades</span><input aria-label="Arquivo CSV" type="file" accept=".csv,text/csv" onChange={e=>void readFile(e.target.files?.[0])}/></label>
        <label className="quote-field">Público das novas oportunidades<select className="ui-input" value={clientType} onChange={e=>{const type=e.target.value as ClientType;setClientType(type);setChoices(prev=>Object.fromEntries(rows.map(row=>[row.key,{...prev[row.key],type:classifyImport(row,opportunities).existing?.type || type}])));}}><option value="PJ">Pessoa jurídica · 30 dias</option><option value="PF">Pessoa física · 15 dias</option></select></label>
      </fieldset>
      <details className="opportunity-import-help"><summary>Como funciona a importação?</summary><p>Colunas obrigatórias: ID, Nome do Cliente e Data Cadastro. O prazo começa na data do arquivo. Status como “Ganha” são ignorados. CPF/CNPJ e telefone podem ser preenchidos depois.</p><p>IDs já importados não são duplicados. Nomes iguais com IDs distintos permanecem separados. A importação não exclui registros e não altera contatos ou observações.</p></details>
      {reading && <p role="status">Lendo arquivo…</p>}
      {rows.length>0 && <>
        <div className="opportunity-import-summary"><span><strong>{counts.new}</strong> novas</span><span><strong>{counts.same}</strong> já importadas</span><span><strong>{counts.changed}</strong> com diferenças</span><span><strong>{counts.invalid}</strong> inválidas</span></div>
        {counts.changed>0 && <label className="opportunity-import-option"><input type="checkbox" checked={updates} disabled={busy} onChange={e=>setUpdates(e.target.checked)}/>Revisar atualizações das existentes <span className="ui-muted">(por padrão, somente novas)</span></label>}
        <div className="opportunity-import-table-wrap" tabIndex={0} role="region" aria-label="Prévia das oportunidades — lista com rolagem"><table className="commission-table"><thead><tr><th><input type="checkbox" aria-label="Selecionar todas as novas" disabled={busy || !counts.new} checked={counts.new>0 && classified.filter(r=>r.kind==='new').every(r=>choices[r.row.key]?.selected)} onChange={e=>{const checked=e.target.checked;setChoices(prev=>{const next={...prev};classified.filter(r=>r.kind==='new').forEach(({row})=>{next[row.key]={...next[row.key],selected:checked};});return next;});}}/></th><th>Cliente / origem</th><th>Cadastro</th><th>Tipo</th><th>Vencimento</th></tr></thead><tbody>{classified.slice((page-1)*25,page*25).map(({row,kind,existing})=>{
          const choice=choices[row.key];const enabled=eligible(kind);
          const similar=kind==='new' && (opportunities.some(o=>normalizeName(o.client_name)===normalizeName(row.client_name)) || rows.some(r=>r.key!==row.key && normalizeName(r.client_name)===normalizeName(row.client_name)));
          const expiration=row.error?'':existing && !choice.recalculate ? existing.expiration_date : expirationFor(row.registration_date,choice.type);
          return <tr key={row.key}><td><input type="checkbox" aria-label={`Importar ${row.client_name} ID ${row.external_id}`} disabled={busy || !enabled} checked={enabled && choice.selected} onChange={e=>patch(row.key,{selected:e.target.checked})}/></td><td data-label="Cliente"><strong>{row.client_name || 'Sem nome'}</strong><small>ID {row.external_id || '—'} · {kind==='new'?'Nova':kind==='same'?'Já importada':kind==='changed'?'Diferenças encontradas':row.error}</small>{similar && <small className="opportunity-import-warning">Nome repetido: confira antes de importar.</small>}{kind==='changed' && existing?.client_name!==row.client_name && <small>Atual: {existing?.client_name}</small>}</td><td data-label="Cadastro">{dateLabel(row.registration_date)}{kind==='changed' && existing?.registration_date!==row.registration_date && <small>Atual: {dateLabel(existing!.registration_date)}</small>}</td><td data-label="Tipo"><select className="ui-input" aria-label={`Tipo ID ${row.external_id}`} value={choice.type} disabled={busy || !enabled} onChange={e=>patch(row.key,{type:e.target.value as ClientType})}><option value="PJ">PJ</option><option value="PF">PF</option></select></td><td data-label="Vencimento">{dateLabel(expiration)}{expiration && expiration<new Date().toLocaleDateString('sv-SE') && <small className="opportunity-import-warning">Vencida</small>}{kind==='changed' && existing && <><small>Atual: {dateLabel(existing.expiration_date)}</small><label className="opportunity-import-option"><input type="checkbox" disabled={busy || !updates} checked={choice.recalculate} onChange={e=>patch(row.key,{recalculate:e.target.checked})}/>Recalcular prazo</label>{!choice.recalculate && <small>Prazo atual preservado</small>}</>}</td></tr>;
        })}</tbody></table></div>
        {rows.length>25 && <nav className="opportunity-pagination" aria-label="Páginas da prévia"><button className="ui-button ui-button-secondary" disabled={page===1 || busy} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>{page} de {Math.ceil(rows.length/25)}</span><button className="ui-button ui-button-secondary" disabled={page*25>=rows.length || busy} onClick={()=>setPage(p=>p+1)}>Próxima</button></nav>}
      </>}
      </>}
      {error && <p className="quote-error" role="alert">{error}</p>}
    </div>
    <footer className="commission-form-footer"><span className="ui-muted">{!result && rows.length>0 ? `${selected.length} selecionadas` : ''}</span><div><button className="ui-button ui-button-secondary" disabled={busy || reading} onClick={onClose}>{result?'Concluir':'Cancelar'}</button>{!result && <button className="ui-button ui-button-primary" disabled={busy || reading || !selected.length} onClick={()=>void confirm()}><Upload size={16}/>{busy?'Importando…':'Confirmar importação'}</button>}</div></footer>
  </QuoteDialog>;
}
