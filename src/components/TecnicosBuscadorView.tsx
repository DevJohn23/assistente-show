'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Mail, Star, Loader2, X, Navigation, Users, Map } from 'lucide-react';
import tecnicosData from '@/data/tecnicos.json';

interface Tecnico {
  id: number;
  nome: string;
  categoria: string;
  tipo: string;
  descricao: string;
  telefone: string;
  email: string;
  lat: number;
  lng: number;
  vendedor_parceiro?: string;
}

interface TecnicoComDistancia extends Tecnico {
  distancia: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function categoriaBadge(cat: string) {
  if (cat.includes('REDE PLUS')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  if (cat.includes('PSO')) return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
  if (cat === 'ATA') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  if (cat === 'SPOT') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
}

const MapLeaflet = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-800/60 rounded-2xl">
      <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
    </div>
  ),
});

export const TecnicosBuscadorView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [clientePos, setClientePos] = useState<{ lat: number; lng: number } | null>(null);
  const [clienteLabel, setClienteLabel] = useState('');
  const [tecnicos5, setTecnicos5] = useState<TecnicoComDistancia[]>([]);
  const [mapTecnicos, setMapTecnicos] = useState<Tecnico[]>(tecnicosData as Tecnico[]);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedTecnico, setSelectedTecnico] = useState<TecnicoComDistancia | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.788, -47.879]);
  const [mapZoom, setMapZoom] = useState(5);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelectedRef = useRef(false);

  const tecnicos = tecnicosData as Tecnico[];

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 4) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      // Verifica se é um CEP (8 números seguidos, com ou sem traço)
      const cepMatch = q.replace(/[^0-9]/g, '');
      if (cepMatch.length === 8) {
        // Tenta buscar no ViaCEP
        const viaCepRes = await fetch(`https://viacep.com.br/ws/${cepMatch}/json/`);
        const viaCepData = await viaCepRes.json();
        
        if (!viaCepData.erro) {
          // Monta o endereço legível
          const addressStr = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}`;
          // Busca as coordenadas no Nominatim usando o endereço retornado pelo ViaCEP
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressStr + ', Brasil')}&format=json&limit=1`,
            { headers: { 'Accept-Language': 'pt-BR' } }
          );
          const nomData: NominatimResult[] = await nomRes.json();
          
          if (nomData.length > 0) {
            setSuggestions([{
              lat: nomData[0].lat,
              lon: nomData[0].lon,
              display_name: `${addressStr} (CEP: ${viaCepData.cep})`
            }]);
            setShowSuggestions(true);
            return;
          }
        }
      }

      // Se não for CEP ou o CEP falhou, busca normalmente no Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Brasil')}&format=json&limit=5&countrycodes=br`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  const buscarTecnicos = useCallback(async (lat: number, lng: number, label: string) => {
    setSearching(true);
    setShowSuggestions(false);
    setClientePos({ lat, lng });
    setClienteLabel(label);
    setSelectedTecnico(null);

    const ranked = tecnicos
      .map((t) => ({ ...t, distancia: haversine(lat, lng, t.lat, t.lng) }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 5);

    setTecnicos5(ranked);
    setMapTecnicos(ranked);
    setSearchMode(true);
    setMapCenter([lat, lng]);
    setMapZoom(10);
    setSearching(false);
  }, [tecnicos]);

  const handleSelectSuggestion = (s: NominatimResult) => {
    justSelectedRef.current = true;
    setQuery(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    buscarTecnicos(parseFloat(s.lat), parseFloat(s.lon), s.display_name);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Brasil')}&format=json&limit=1&countrycodes=br`,
        { headers: { 'Accept-Language': 'pt-BR' } }
      );
      const data: NominatimResult[] = await res.json();
      if (data.length > 0) {
        buscarTecnicos(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
      } else {
        setSearching(false);
      }
    } catch {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setClientePos(null);
    setTecnicos5([]);
    setMapTecnicos(tecnicosData as Tecnico[]);
    setSearchMode(false);
    setSelectedTecnico(null);
    setMapCenter([-15.788, -47.879]);
    setMapZoom(5);
    inputRef.current?.focus();
  };

  const waHref = (tel: string) => {
    const digits = tel.replace(/\D/g, '');
    // Se já tem 12+ dígitos (com código do país), usa direto; senão adiciona 55
    const full = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
    return `https://wa.me/${full}`;
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-130px)] min-h-[600px]">
      {/* Search Bar */}
      <div className="relative z-[2000]">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Digite o endereço do cliente (ex: Rua Pedro II, Guarabira - PB)"
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 transition-all"
            />
            {query && (
              <button type="button" onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/20"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            {searching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            {loadingSuggestions && (
              <div className="px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Buscando...
              </div>
            )}
            {suggestions.map((s, i) => (
              <button key={i} type="button" onClick={() => handleSelectSuggestion(s)}
                className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-start gap-2 border-b border-slate-700/60 last:border-0">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-sky-400 shrink-0" />
                <span className="line-clamp-1">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Map */}
        <div className="flex-1 min-h-[320px] lg:min-h-0 rounded-2xl overflow-hidden border border-slate-700/60 shadow-xl">
          <MapLeaflet
            center={mapCenter}
            zoom={mapZoom}
            clientePos={clientePos}
            clienteLabel={clienteLabel}
            tecnicos={mapTecnicos}
            selectedId={selectedTecnico?.id ?? null}
            searchMode={searchMode}
            onSelectTecnico={(t) => setSelectedTecnico(t as TecnicoComDistancia)}
          />
        </div>

        {/* Lista */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>{tecnicos5.length > 0 ? `${tecnicos5.length} técnicos encontrados` : `${tecnicos.length} técnicos na rede`}</span>
            </div>
            {clienteLabel && (
              <span className="text-xs text-sky-400 font-medium truncate max-w-[160px]" title={clienteLabel}>
                📍 {clienteLabel.split(',')[0]}
              </span>
            )}
          </div>

          {/* Estado inicial sem pesquisa */}
          {!searchMode && !selectedTecnico && (
            <div className="flex-1 flex flex-col gap-3">
              {/* Instrução */}
              <div className="flex flex-col items-center justify-center text-center py-8 px-4 bg-slate-800/40 rounded-2xl border border-slate-700/40">
                <div className="w-12 h-12 rounded-2xl bg-slate-700/60 flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-300 font-semibold text-sm mb-1">Clique em um pino</p>
                <p className="text-slate-500 text-xs max-w-[210px]">
                  ou busque um endereço para encontrar os 5 técnicos mais próximos
                </p>
              </div>
              {/* Legenda de categorias */}
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/40 p-4">
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Legenda</p>
                <div className="space-y-2">
                  {[
                    { label: 'Rede Plus', color: '#f59e0b' },
                    { label: 'PSO / PSO c/ Estoque', color: '#38bdf8' },
                    { label: 'ATA', color: '#f87171' },
                    { label: 'SPOT', color: '#34d399' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 36" className="w-3.5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill={color}/>
                        <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
                      </svg>
                      <span className="text-xs text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Técnico selecionado pelo mapa no modo inicial */}
          {!searchMode && selectedTecnico && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setSelectedTecnico(null)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors self-start"
              >
                <X className="w-3 h-3" /> Voltar para legenda
              </button>
              <div className="p-4 rounded-2xl border bg-sky-600/20 border-sky-500/60 shadow-lg shadow-sky-500/10 text-left">
                <p className="text-sm font-semibold text-slate-100 leading-snug mb-2">
                  {selectedTecnico.nome.replace(/^(ATA\d+_|PSO_|SPOT_|PRP_BOSCH_|PRP_)/, '')}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoriaBadge(selectedTecnico.categoria)}`}>
                    {selectedTecnico.categoria}
                  </span>
                  {selectedTecnico.tipo && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-600/30 text-slate-400 border-slate-600/40">
                      {selectedTecnico.tipo}
                    </span>
                  )}
                  {selectedTecnico.vendedor_parceiro && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-600/30 text-violet-400 border-violet-600/40 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Parceiro: {selectedTecnico.vendedor_parceiro}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {selectedTecnico.telefone && (
                    <a href={waHref(selectedTecnico.telefone)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      {selectedTecnico.telefone}
                    </a>
                  )}
                  {selectedTecnico.email && (
                    <a href={`mailto:${selectedTecnico.email}`}
                      className="flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
                        <Mail className="w-3 h-3" />
                      </div>
                      <span className="truncate">{selectedTecnico.email}</span>
                    </a>
                  )}
                  <a href={`https://www.google.com/maps/dir/?api=1${clientePos ? `&origin=${clientePos.lat},${clientePos.lng}` : ''}&destination=${selectedTecnico.lat},${selectedTecnico.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                        <Map className="w-3 h-3" />
                      </div>
                      <span className="truncate">Ver rota no Google Maps</span>
                    </a>
                </div>
              </div>
            </div>
          )}


          {tecnicos5.map((t, idx) => {
            const isRecomendado = idx === 0;
            const isSelected = selectedTecnico?.id === t.id;
            return (
              <button key={t.id} onClick={() => setSelectedTecnico(isSelected ? null : t)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-sky-600/20 border-sky-500/60 shadow-lg shadow-sky-500/10'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isRecomendado ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/40' : 'bg-slate-700 text-slate-300'
                    }`}>{idx + 1}</div>
                    <p className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2">
                      {t.nome.replace(/^(ATA\d+_|PSO_|SPOT_|PRP_BOSCH_|PRP_)/, '')}
                    </p>
                  </div>
                  {isRecomendado && (
                    <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold whitespace-nowrap">
                      <Star className="w-2.5 h-2.5" /> Recomendado
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoriaBadge(t.categoria)}`}>
                    {t.categoria}
                  </span>
                  {t.tipo && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-slate-600/30 text-slate-400 border-slate-600/40">
                      {t.tipo}
                    </span>
                  )}
                  {t.vendedor_parceiro && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-violet-600/30 text-violet-400 border-violet-600/40 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Parceiro: {t.vendedor_parceiro}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold mb-2">
                  <Navigation className="w-3 h-3" />
                  {t.distancia < 10 ? `${t.distancia.toFixed(1)} km` : `${Math.round(t.distancia)} km`}
                  <span className="text-slate-500 font-normal">em linha reta</span>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 space-y-2">
                    {t.telefone && (
                      <a
                        href={waHref(t.telefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                          {/* WhatsApp icon */}
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        {t.telefone}
                      </a>
                    )}
                    {t.email && (
                      <a href={`mailto:${t.email}`} onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors group">
                        <div className="w-6 h-6 rounded-lg bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
                          <Mail className="w-3 h-3" />
                        </div>
                        <span className="truncate">{t.email}</span>
                      </a>
                    )}
                    <a href={`https://www.google.com/maps/dir/?api=1${clientePos ? `&origin=${clientePos.lat},${clientePos.lng}` : ''}&destination=${t.lat},${t.lng}`}
                      target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors group">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                        <Map className="w-3 h-3" />
                      </div>
                      <span className="truncate">Ver rota no Google Maps</span>
                    </a>
                  </div>
                )}
                {!isSelected && (t.telefone || t.email) && (
                  <p className="text-[10px] text-slate-500 mt-1">Clique para ver contato</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
