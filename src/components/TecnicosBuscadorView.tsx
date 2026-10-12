'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Mail, Loader2, Navigation, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Tecnico } from '@/types';

export type TecnicoResultado = Tecnico & { distancia?: number };
type Location = { lat: number; lng: number; label: string; approximate?: boolean };
const categories = ['Rede Plus', 'PSO', 'ATA', 'SPOT'];
export const technicianName = (name: string) => name.replace(/^(ATA\d+_|PSO_|SPOT_|PRP_BOSCH_|PRP_)/, '');
export const technicianCategory = (cat: string) => cat?.includes('REDE PLUS') ? 'Rede Plus' : cat?.includes('PSO') ? 'PSO' : cat || 'Outros';
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function distance(a: Location, t: Tecnico) {
  const rad = Math.PI / 180;
  const h = Math.sin((t.lat-a.lat)*rad/2)**2 + Math.cos(a.lat*rad)*Math.cos(t.lat*rad)*Math.sin((t.lng-a.lng)*rad/2)**2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
const whatsapp = (phone: string) => { const n = phone.replace(/\D/g, ''); return `https://wa.me/${n.startsWith('55') && n.length >= 12 ? n : `55${n}`}`; };
const MapLeaflet = dynamic(() => import('./MapLeaflet'), { ssr: false, loading: () => <div className="technical-state" role="status"><Loader2 className="animate-spin" /> Carregando mapa…</div> });
async function getJson(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, headers: { 'Accept-Language': 'pt-BR' } });
  if (!response.ok) throw new Error('request failed');
  return response.json();
}
async function locations(query: string, signal: AbortSignal): Promise<Location[]> {
  const lookup = async (q: string): Promise<Location[]> => {
    const data = await getJson(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=br`, signal);
    return data.map((item: { lat: string; lon: string; display_name: string }) => ({lat: Number(item.lat), lng: Number(item.lon), label: item.display_name})).filter((item: Location) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
  };
  if (/^\d{5}-?\d{3}$/.test(query.trim())) {
    const cep = await getJson(`https://viacep.com.br/ws/${query.replace(/\D/g, '')}/json/`, signal);
    if (cep.erro) return [];
    const city = `${cep.localidade} - ${cep.uf}`;
    if (cep.logradouro) {
      const exact = await lookup(`${cep.logradouro}, ${city}, Brasil`);
      if (exact.length) return exact.map(item => ({...item, label: `${cep.logradouro}, ${cep.bairro}, ${city} · CEP ${cep.cep}`}));
    }
    return (await lookup(`${city}, Brasil`)).map(item => ({...item, label: `${city} · CEP ${cep.cep}`, approximate: true}));
  }
  return lookup(`${query}, Brasil`);
}

export const TecnicosBuscadorView: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [mode, setMode] = useState<'address' | 'name'>('address');
  const [query, setQuery] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [category, setCategory] = useState('');
  const [origin, setOrigin] = useState<Location | null>(null);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [fitVersion, setFitVersion] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionCache = useRef(new Map<string, Location[]>());
  const searchRequest = useRef<AbortController | null>(null);
  const cards = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError(false);
    (async () => {
      try {
        const {data, error} = await supabase.from('tecnicos').select('*');
        if (error) throw error;
        if (active) setTecnicos((data || []).filter(t => Number.isFinite(t.lat) && Number.isFinite(t.lng)));
      } catch { if (active) setLoadError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [retry]);
  useEffect(() => () => { searchRequest.current?.abort(); if (suggestionTimer.current) clearTimeout(suggestionTimer.current); }, []);

  const results = useMemo<TecnicoResultado[]>(() => {
    const filtered = tecnicos.filter(t => !category || technicianCategory(t.categoria) === category);
    if (mode === 'address') return origin ? filtered.map(t => ({...t, distancia: distance(origin,t)})).sort((a,b) => a.distancia-b.distancia).slice(0,5) : filtered;
    const term = normalize(nameQuery.trim());
    return filtered.filter(t => normalize(`${t.nome} ${t.categoria} ${t.vendedor_parceiro || ''}`).includes(term));
  }, [tecnicos, category, mode, origin, nameQuery]);
  const selected = results.find(t => t.id === selectedId);
  const showList = mode === 'name' || !!origin;
  const visibleCards = showList ? results : selected ? [selected] : [];

  useEffect(() => {
    if (!selected) { setAddress(''); return; }
    const controller = new AbortController();
    setAddress(''); setAddressLoading(true);
    getJson(`https://nominatim.openstreetmap.org/reverse?lat=${selected.lat}&lon=${selected.lng}&format=json`, controller.signal)
      .then(data => setAddress(data.display_name || 'Endereço indisponível. Consulte a localização no mapa.'))
      .catch(() => { if (!controller.signal.aborted) setAddress('Não foi possível consultar o endereço. A localização continua disponível no mapa.'); })
      .finally(() => { if (!controller.signal.aborted) setAddressLoading(false); });
    return () => controller.abort();
  }, [selected]);

  const selectTechnician = useCallback((t: TecnicoResultado) => {
    setSelectedId(t.id);
    requestAnimationFrame(() => cards.current.get(t.id)?.scrollIntoView({block:'nearest', behavior: 'auto'}));
  }, []);
  const cancelSearch = () => { if (suggestionTimer.current) clearTimeout(suggestionTimer.current); setActiveSuggestion(-1); searchRequest.current?.abort(); setSearching(false); setSuggestions([]); setSearchError(''); };
  const chooseLocation = (location: Location) => { cancelSearch(); setOrigin(location); setQuery(location.label); setSuggestions([]); setSelectedId(null); setFitVersion(v=>v+1); };
  const suggest = (value: string) => {
    cancelSearch(); setQuery(value);
    const term = value.trim();
    if (term.length < 4) return;
    suggestionTimer.current = setTimeout(async () => {
      const cached = suggestionCache.current.get(term);
      if (cached) { setSuggestions(cached); return; }
      const controller = new AbortController(); searchRequest.current = controller;
      setSearching(true);
      try {
        const data = await getJson(`https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=5&countrycode=BR`, controller.signal);
        const found: Location[] = (data.features || []).map((item: {geometry: {coordinates: number[]}; properties: Record<string,string>}) => {
          const p = item.properties;
          return {lat:item.geometry.coordinates[1], lng:item.geometry.coordinates[0], label:Array.from(new Set([p.name, p.street, p.housenumber, p.district, p.city, p.state, p.postcode].filter(Boolean))).join(', ')};
        }).filter((item: Location) => item.label && Number.isFinite(item.lat) && Number.isFinite(item.lng));
        if (controller.signal.aborted) return;
        if (suggestionCache.current.size >= 40) suggestionCache.current.clear();
        suggestionCache.current.set(term, found); setSuggestions(found);
      } catch { if (!controller.signal.aborted) setSearchError('Sugestões indisponíveis. Use Buscar para consultar o endereço.'); }
      finally { if (!controller.signal.aborted) setSearching(false); }
    }, 600);
  };
  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (activeSuggestion >= 0 && suggestions[activeSuggestion]) { chooseLocation(suggestions[activeSuggestion]); return; }
    cancelSearch();
    if (!query.trim()) return;
    const controller = new AbortController(); searchRequest.current = controller;
    setSearching(true);
    try {
      const found = await locations(query.trim(), controller.signal);
      if (controller.signal.aborted) return;
      if (found.length === 1) chooseLocation(found[0]);
      else if (found.length) setSuggestions(found);
      else setSearchError('Endereço não encontrado. Confira o CEP ou inclua a cidade e o estado.');
    } catch { if (!controller.signal.aborted) setSearchError('Não foi possível buscar o endereço. Tente novamente.'); }
    finally { if (!controller.signal.aborted) setSearching(false); }
  };

  return <section className="technical-page">
    <header className="technical-heading"><h1>Rede técnica</h1><p>Encontre um técnico e consulte as opções de atendimento.</p></header>
    <div className="ui-panel technical-search" onBlur={e=>{if (!e.currentTarget.contains(e.relatedTarget as Node | null)) cancelSearch();}}>
      <div className="technical-modes" role="group" aria-label="Tipo de busca">
        {([['address','Por endereço ou CEP'],['name','Por técnico']] as const).map(([value,label]) => <button key={value} type="button" aria-pressed={mode===value} onClick={()=>{cancelSearch();setMode(value);setSelectedId(null);}}>{label}</button>)}
      </div>
      <div className="technical-search-row">
        {mode === 'address' ? <form onSubmit={search} className="technical-search-form">
          <label className="technical-input"><Search size={17}/><input className="ui-input" aria-label="Endereço ou CEP do cliente" placeholder="Endereço, cidade ou CEP do cliente" value={query} role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length > 0} aria-controls="technical-address-options" aria-activedescendant={activeSuggestion >= 0 ? `technical-address-${activeSuggestion}` : undefined} autoComplete="off" onChange={e=>suggest(e.target.value)} onKeyDown={e=>{
            if (e.key === 'Escape') { e.preventDefault(); cancelSearch(); }
            if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && suggestions.length) {
              e.preventDefault(); setActiveSuggestion(i=>e.key === 'ArrowDown' ? (i+1)%suggestions.length : (i<=0?suggestions.length-1:i-1));
            }
          }} /></label>
          <button className="ui-button ui-button-primary" disabled={!query.trim()}>{searching ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>} {searching ? 'Buscando…' : 'Buscar'}</button>
        </form> : <label className="technical-input"><Search size={17}/><input className="ui-input" aria-label="Nome, categoria ou parceiro" placeholder="Nome, categoria ou parceiro" value={nameQuery} onChange={e=>{setNameQuery(e.target.value);setSelectedId(null);}}/></label>}
        <select className="ui-input technical-category" aria-label="Categoria do técnico" value={category} onChange={e=>{setCategory(e.target.value);setSelectedId(null);}}><option value="">Todas as categorias</option>{categories.map(c=><option key={c}>{c}</option>)}</select>
        {(query || nameQuery || category || origin) && <button className="ui-button ui-button-secondary" onClick={()=>{cancelSearch();setQuery('');setNameQuery('');setCategory('');setOrigin(null);setSelectedId(null);setFitVersion(v=>v+1);}}>Limpar</button>}
      </div>
      {searchError && <p className="technical-error" role="alert">{searchError}</p>}
      {suggestions.length>0 && <div className="technical-suggestions"><p>Selecione o endereço do cliente</p><div id="technical-address-options" role="listbox" aria-label="Endereços sugeridos">{suggestions.map((s,i)=><button type="button" role="option" aria-selected={activeSuggestion===i} id={`technical-address-${i}`} key={i} onMouseDown={e=>e.preventDefault()} onClick={()=>chooseLocation(s)}><MapPin size={16}/>{s.label}</button>)}</div><small>Dados © OpenStreetMap · Sugestões Photon</small></div>}
    </div>
    <div className="technical-workspace">
      <aside className="ui-panel technical-results" aria-label="Técnicos encontrados">
        <div className="technical-results-heading"><h2>{origin && mode==='address' ? 'Técnicos mais próximos' : 'Técnicos da rede'}</h2><span aria-live="polite">{loading ? 'Carregando…' : loadError ? 'Consulta indisponível' : `${results.length} ${results.length===1?'técnico':'técnicos'}`}</span></div>
        {origin && mode==='address' && <div className="technical-origin"><MapPin size={16}/><div>{origin.label}{origin.approximate && <small>Localização aproximada: centro da cidade.</small>}</div></div>}
        <div className="technical-list">
          {loading ? <div className="technical-state" role="status"><Loader2 className="animate-spin"/>Carregando técnicos…</div> : loadError ? <div className="technical-state" role="alert"><p>Não foi possível carregar a rede técnica.</p><button className="ui-button ui-button-secondary" onClick={()=>setRetry(v=>v+1)}>Tentar novamente</button></div> : results.length===0 ? <div className="technical-state"><Search/><h3>Nenhum técnico encontrado</h3><p>Tente outro nome ou categoria.</p></div> : !showList && !selected ? <div className="technical-state"><MapPin/><h3>Onde o cliente precisa de atendimento?</h3><p>Busque um endereço para ver os cinco técnicos mais próximos ou selecione um ponto no mapa.</p></div> : visibleCards.map((t,index)=>{
            const name = technicianName(t.nome); const active = t.id===selectedId;
            return <article key={t.id} ref={el=>{if(el)cards.current.set(t.id,el);else cards.current.delete(t.id);}} className={`technical-card ${active?'is-selected':''}`}>
              <button className="technical-card-select" aria-label={`Ver detalhes de ${name}`} aria-expanded={active} onClick={()=>active?setSelectedId(null):selectTechnician(t)}>
                <div className="technical-card-title"><strong>{name}</strong>{t.distancia!==undefined && index===0 && <span className="technical-nearest">Mais próximo</span>}</div>
                <div className="technical-meta"><span>{t.categoria || 'Outros'}</span>{t.tipo && <span>{t.tipo}</span>}</div>
                {t.distancia!==undefined && <p className="technical-distance">{t.distancia.toLocaleString('pt-BR',{maximumFractionDigits:1})} km em linha reta</p>}
              </button>
              <div className="technical-actions">
                {t.telefone && <a className="ui-button ui-button-secondary technical-whatsapp" href={whatsapp(t.telefone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${name}`}><WhatsAppIcon size={15}/>WhatsApp</a>}
                <a className="ui-button ui-button-secondary" href={`https://www.google.com/maps/dir/?api=1${origin && mode==='address'?`&origin=${origin.lat},${origin.lng}`:''}&destination=${t.lat},${t.lng}`} target="_blank" rel="noopener noreferrer" aria-label={`Ver rota para ${name}`}><Navigation size={15}/>Ver rota</a>
              </div>
              {active && <div className="technical-details"><p>{addressLoading?'Consultando endereço…':address}</p>{t.vendedor_parceiro && <p>Parceiro: {t.vendedor_parceiro}</p>}{t.telefone && <p>{t.telefone}</p>}{t.email && <a href={`mailto:${t.email}`}><Mail size={15}/>{t.email}</a>}{!t.telefone && !t.email && <p>Contato não informado.</p>}<button className="ui-button ui-button-secondary" onClick={()=>setSelectedId(null)}><X size={14}/>Fechar detalhes</button></div>}
            </article>;
          })}
        </div>
      </aside>
      <div className="ui-panel technical-map-panel">
        <div className="technical-map-toolbar"><button className="ui-button ui-button-secondary" onClick={()=>{setSelectedId(null);setFitVersion(v=>v+1);}}><MapPin size={15}/>Ver todos no mapa</button><details><summary>Legenda</summary><div>{['Cliente',...categories,'Outros'].map((c,i)=><span key={c}><i style={{background:['#2563eb','#b7791f','#0284c7','#be5269','#15856c','#64748b'][i]}}/>{c}</span>)}</div></details></div>
        <MapLeaflet tecnicos={results} selectedId={selected?.id ?? null} clientePos={mode==='address'?origin:null} searchMode={mode==='address' && !!origin} fitVersion={fitVersion} onSelectTecnico={selectTechnician}/>
      </div>
    </div>
  </section>;
};
