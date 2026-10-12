'use client';

import React, { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TecnicoResultado, technicianName, technicianCategory } from './TecnicosBuscadorView';

type Props = {
  tecnicos: TecnicoResultado[];
  selectedId: number | null;
  clientePos: {lat: number; lng: number} | null;
  searchMode: boolean;
  fitVersion: number;
  onSelectTecnico: (t: TecnicoResultado) => void;
};
const colors: Record<string,string> = {'Rede Plus':'#b7791f',PSO:'#0284c7',ATA:'#be5269',SPOT:'#15856c',Outros:'#64748b'};
export default function MapLeaflet({tecnicos,selectedId,clientePos,searchMode,fitVersion,onSelectTecnico}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [instance, setInstance] = useState<{map: Leaflet.Map; L: typeof Leaflet} | null>(null);
  const [error, setError] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [retry, setRetry] = useState(0);
  const selectRef = useRef(onSelectTecnico);
  useEffect(()=>{selectRef.current=onSelectTecnico;},[onSelectTecnico]);
  useEffect(()=>{
    let disposed=false; let map: Leaflet.Map | undefined; let observer: ResizeObserver | undefined;
    setError(false);setTileError(false);
    import('leaflet').then(L=>{
      if(disposed || !container.current) return;
      map=L.map(container.current,{center:[-15.788,-47.879],zoom:4,zoomControl:false});
      L.control.zoom({position:'bottomleft'}).addTo(map);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}).on('tileerror',()=>{if(!disposed)setTileError(true);}).addTo(map);
      observer=new ResizeObserver(()=>map?.invalidateSize());observer.observe(container.current);
      setInstance({map,L});
    }).catch(()=>{if(!disposed)setError(true);});
    return ()=>{disposed=true;observer?.disconnect();map?.remove();};
  },[retry]);
  useEffect(()=>{
    if(!instance) return;
    const {map,L}=instance; const group=L.layerGroup().addTo(map);
    if(clientePos){
      L.marker([clientePos.lat,clientePos.lng],{title:'Localização do cliente',icon:L.divIcon({className:'technical-client-marker',html:'<span>C</span>',iconSize:[30,30],iconAnchor:[15,15]})}).addTo(group).bindTooltip('Cliente');
    }
    tecnicos.forEach((t,index)=>{
      const selected=t.id===selectedId;
      const color=colors[technicianCategory(t.categoria)] || colors.Outros;
      const icon=L.divIcon({className:`technical-marker ${selected?'is-selected':''}`,html:`<svg viewBox="0 0 32 44" width="32" height="44" aria-hidden="true"><path d="M16 2C8.3 2 2 8.3 2 16c0 10 14 25 14 25s14-15 14-25C30 8.3 23.7 2 16 2Z" fill="${color}" stroke="${selected?'#2563eb':'white'}" stroke-width="3"/><circle cx="16" cy="16" r="9" fill="white"/>${searchMode?`<text x="16" y="20" text-anchor="middle" font-size="12" font-weight="700" fill="${color}">${index+1}</text>`:`<circle cx="16" cy="16" r="4" fill="${color}"/>`}</svg>`,iconSize:[32,44],iconAnchor:[16,42]});
      const tooltip=document.createElement('span');tooltip.textContent=technicianName(t.nome);
      L.marker([t.lat,t.lng],{icon,title:technicianName(t.nome),alt:technicianName(t.nome)}).addTo(group).bindTooltip(tooltip).on('click',()=>selectRef.current(t));
    });
    return ()=>{group.remove();};
  },[instance,tecnicos,selectedId,clientePos,searchMode]);
  useEffect(()=>{
    if(!instance) return;
    const points: Leaflet.LatLngExpression[]=tecnicos.map(t=>[t.lat,t.lng]);
    if(clientePos) points.push([clientePos.lat,clientePos.lng]);
    if(points.length) instance.map.fitBounds(instance.L.latLngBounds(points),{padding:[35,35],maxZoom:12,animate:false});
    else instance.map.setView([-15.788,-47.879],4);
  },[instance,tecnicos,clientePos,fitVersion]);
  useEffect(()=>{
    const t=tecnicos.find(t=>t.id===selectedId);
    if(instance && t) instance.map.setView([t.lat,t.lng],Math.max(instance.map.getZoom(),12),{animate:false});
  },[instance,selectedId,tecnicos]);
  return <div className="technical-map"><div ref={container} className="technical-map-canvas" aria-label="Mapa da rede técnica"/>{(error || tileError) && <div className="technical-map-warning" role="status">{error?'Não foi possível abrir o mapa.':'Algumas áreas do mapa não carregaram.'} Os contatos continuam disponíveis na lista. <button onClick={()=>{setInstance(null);setRetry(v=>v+1);}}>Tentar novamente</button></div>}</div>;
}
