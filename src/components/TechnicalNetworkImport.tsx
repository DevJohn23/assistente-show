'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ImportedTechnician, MAX_KML_BYTES, parseTechnicalKml } from '@/lib/technicalKml';
import { QuoteDialog } from './QuoteControls';
import { Upload, FileText, History as HistoryIcon, X } from 'lucide-react';

type Preview = { revision: string; added: string[]; missing: string[]; changed: {name:string; before:Record<string,unknown>; after:Record<string,unknown>}[]; unchanged:number; active:number };
type History = {id:string; filename:string; actor_email:string; created_at:string; restored_from:string|null};
const fieldNames: Record<string,string> = {nome:'Nome',categoria:'Categoria',tipo:'Tipo',descricao:'Descrição',telefone:'Telefone',email:'E-mail',lat:'Latitude',lng:'Longitude',vendedor_parceiro:'Parceiro',is_active:'Ativo'};
const display = (value:unknown) => value === true ? 'Sim' : value === false ? 'Não' : String(value ?? '—');
export function TechnicalNetworkImport({onUpdated}:{onUpdated:(message:string)=>Promise<void>}) {
  const [open,setOpen] = useState(false);
  const [section,setSection] = useState<'upload'|'history'>('upload');
  const [rows,setRows] = useState<ImportedTechnician[]>([]);
  const [filename,setFilename] = useState('');
  const [mapName,setMapName] = useState('');
  const [warnings,setWarnings] = useState<string[]>([]);
  const [deactivate,setDeactivate] = useState(false);
  const [confirmed,setConfirmed] = useState(false);
  const [preview,setPreview] = useState<Preview|null>(null);
  const [restore,setRestore] = useState<string|null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [history,setHistory] = useState<History[]>([]);
  const [historyError,setHistoryError] = useState('');
  const refresh = useCallback(async () => {
    const {data,error} = await supabase.from('technical_network_imports').select('id,filename,actor_email,created_at,restored_from').order('created_at',{ascending:false}).limit(20);
    setHistoryError(error ? 'Não foi possível carregar o histórico de importações.' : '');
    if (!error) setHistory(data || []);
  },[]);
  useEffect(()=>{if(open) void refresh();},[open,refresh]);
  function reset() {setRows([]);setFilename('');setMapName('');setWarnings([]);setDeactivate(false);setConfirmed(false);setPreview(null);setRestore(null);setError('');}
  async function selectFile(file:File|undefined) {
    reset(); if (!file) return;
    setBusy(true);
    try {
      if (!/\.kml$/i.test(file.name)) throw new Error('Selecione um arquivo .kml. KMZ não é aceito nesta versão.');
      if (file.size > MAX_KML_BYTES) throw new Error('O arquivo deve ter até 5 MB.');
      const parsed = parseTechnicalKml(await file.text());
      setRows(parsed.rows);setFilename(file.name);setMapName(parsed.name);setWarnings(parsed.warnings);
    } catch(e) {setError(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.');}
    finally {setBusy(false);}
  }
  async function requestPreview(restoreId:string|null = restore, name = filename) {
    setBusy(true);setError('');setPreview(null);setConfirmed(false);
    try {
      const {data,error} = await supabase.rpc('import_technical_network',{p_rows:restoreId?[]:rows,p_filename:name,p_deactivate:deactivate,p_restore:restoreId});
      if(error) throw new Error(error.message);
      setPreview(data as Preview);setRestore(restoreId);setFilename(name);
    } catch(e) {setError(e instanceof Error ? e.message : 'Não foi possível gerar a prévia.');}
    finally {setBusy(false);}
  }
  async function apply() {
    if (!preview || !confirmed || busy) return;
    setBusy(true);setError('');
    try {
      const {error} = await supabase.rpc('import_technical_network',{p_rows:restore?[]:rows,p_filename:filename,p_deactivate:deactivate,p_restore:restore,p_apply:true,p_expected:preview.revision});
      if(error) throw new Error(error.message);
      const message = restore ? 'Versão anterior restaurada. A operação foi registrada no histórico.' : 'Rede técnica atualizada. Os dados estarão disponíveis ao abrir novamente a consulta da rede.';
      setOpen(false);reset();await onUpdated(message);
    } catch(e) {setPreview(null);setConfirmed(false);setError(`${e instanceof Error ? e.message : 'Não foi possível confirmar a atualização.'} Gere uma nova prévia para conferir o estado atual antes de tentar novamente.`);}
    finally {setBusy(false);}
  }
  return <>
    <button className="ui-button ui-button-secondary" onClick={()=>{reset();setSection('upload');setOpen(true);}}><Upload size={16}/>Importar KML</button>
    {open && <QuoteDialog label="Atualizar rede técnica" canClose={!busy} onClose={()=>setOpen(false)} className="technical-import-dialog">
      <header className="technical-import-header"><div><h2>Atualizar rede técnica</h2><p className="ui-muted">Importe uma nova versão ou consulte o histórico.</p></div><button className="ui-icon-button" aria-label="Fechar atualização da rede" disabled={busy} onClick={()=>setOpen(false)}><X size={20}/></button></header>
      <nav className="technical-import-tabs" aria-label="Seções da atualização"><button type="button" aria-pressed={section==='upload'} disabled={busy} onClick={()=>setSection('upload')}><Upload size={16}/>Importar arquivo</button><button type="button" aria-pressed={section==='history'} disabled={busy} onClick={()=>setSection('history')}><HistoryIcon size={16}/>Histórico</button></nav>
      <div className="technical-import-body">
      {section==='history' ? <div className="technical-import-history-list">{historyError && <p role="alert" className="auth-error">{historyError} <button className="ui-button ui-button-secondary" onClick={()=>void refresh()}>Tentar novamente</button></p>}
          <p className="ui-muted">Consulte as últimas atualizações ou recupere a rede anterior a uma delas.</p>
          {!history.length && !historyError && <div className="technical-import-empty"><HistoryIcon size={28}/><strong>Nenhuma atualização registrada</strong><p>As importações confirmadas aparecerão aqui.</p></div>}
          {history.map(h=><div className="technical-import-history" key={h.id}><div><strong>{h.filename}</strong><small>{new Date(h.created_at).toLocaleString('pt-BR')} · {h.actor_email}{h.restored_from ? ' · Restauração' : ''}</small></div><button className="ui-button ui-button-secondary" disabled={busy} onClick={()=>{reset();setSection('upload');void requestPreview(h.id,`Restaurar: ${h.filename}`.slice(0,300));}}>Restaurar versão anterior</button></div>)}
          {history.length>0 && <p className="ui-muted">A restauração abre uma prévia antes de aplicar. Alterações posteriores à versão escolhida poderão ser desfeitas.</p>}</div> : <>
      {!restore && <>
        <label className="technical-import-file"><input aria-label="Arquivo KML" type="file" accept=".kml,application/vnd.google-earth.kml+xml" disabled={busy} onChange={e=>void selectFile(e.target.files?.[0])}/><span className="technical-import-file-icon"><FileText size={24}/></span><strong>{filename || 'Selecionar arquivo KML'}</strong><span className="ui-muted">{filename ? 'Clique para trocar o arquivo' : 'Mapa completo · até 5 MB'}</span></label>
        {rows.length>0 && <p className="technical-import-file-summary"><strong>{mapName || filename}</strong> · {rows.length} {rows.length===1?'técnico encontrado':'técnicos encontrados'}</p>}
        <details className="technical-import-help"><summary>Como preparar o arquivo</summary><p>No My Maps, exporte o mapa inteiro como KML, sem link de rede. A comparação usa o nome do técnico; nomes alterados aparecem como novos e ausentes.</p></details>
        {warnings.length>0 && <details className="technical-import-help"><summary>Avisos de leitura ({warnings.length})</summary><ul>{warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></details>}
        {rows.length>0 && <label className="technical-import-option"><input type="checkbox" disabled={busy} checked={deactivate} onChange={e=>{setDeactivate(e.target.checked);setPreview(null);setConfirmed(false);}}/><span>Inativar técnicos que não aparecem neste arquivo<small>Desmarcado: mantém os cadastros ausentes.</small></span></label>}
        {deactivate && <p role="note">Use somente com o mapa completo. Técnicos ausentes deixarão de aparecer na consulta, mas serão preservados para restauração.</p>}
      </>}
      {restore && <p>Você está revisando a restauração de uma versão anterior da rede.</p>}
      {error && <p role="alert" className="auth-error">{error}</p>}
      {preview && <div className="technical-import-preview">
        <p><strong>{preview.added.length} novos · {preview.changed.length} alterados · {preview.missing.length} ausentes</strong></p><p>{preview.unchanged} sem alteração · {preview.active} ativos após confirmar</p>
        {preview.added.length>0 && <details><summary>Novos técnicos</summary><ul>{preview.added.map(n=><li key={n}>{n}</li>)}</ul></details>}
        {preview.missing.length>0 && <details><summary>Ausentes — {deactivate?'serão inativados':'serão mantidos'}</summary><ul>{preview.missing.map(n=><li key={n}>{n}</li>)}</ul></details>}
        {preview.changed.length>0 && <details><summary>Conferir alterações</summary>{preview.changed.map((c,i)=><div className="technical-import-change" key={i}><strong>{c.name}</strong>{Object.entries(fieldNames).filter(([key])=>c.before[key]!==c.after[key]).map(([key,label])=><p key={key}>{label}: <del>{display(c.before[key])}</del> → <ins>{display(c.after[key])}</ins></p>)}</div>)}</details>}
        <label className="technical-import-option"><input type="checkbox" disabled={busy} checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Conferi as alterações e quero aplicá-las à rede técnica.</label>
      </div>}
      </>}
      </div>
      <footer className="technical-import-footer"><button className="ui-button ui-button-secondary" disabled={busy} onClick={()=>setOpen(false)}>Cancelar</button>{section==='upload' && <><button className="ui-button ui-button-secondary" disabled={busy || (!rows.length && !restore)} onClick={()=>void requestPreview()}>{busy?'Processando…':'Gerar prévia'}</button>{preview && <button className="ui-button ui-button-primary" disabled={busy || !confirmed || !preview || preview.added.length+preview.changed.length===0} onClick={()=>void apply()}>Confirmar atualização</button>}</>}</footer>
    </QuoteDialog>}
  </>;
}
