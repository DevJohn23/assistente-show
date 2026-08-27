'use client';

import React, { useEffect, useRef } from 'react';

interface Tecnico {
  id: number;
  nome: string;
  categoria: string;
  tipo: string;
  telefone: string;
  email: string;
  lat: number;
  lng: number;
  distancia?: number;
  vendedor_parceiro?: string;
}

interface MapLeafletProps {
  center: [number, number];
  zoom: number;
  clientePos: { lat: number; lng: number } | null;
  clienteLabel: string;
  tecnicos: Tecnico[];
  selectedId: number | null;
  searchMode: boolean;
  onSelectTecnico: (t: Tecnico) => void;
}

export default function MapLeaflet({
  center,
  zoom,
  clientePos,
  clienteLabel,
  tecnicos,
  selectedId,
  searchMode,
  onSelectTecnico,
}: MapLeafletProps) {
  const mapRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null);
  const markersRef = useRef<ReturnType<typeof import('leaflet')['marker']>[]>([]);
  const clienteMarkerRef = useRef<ReturnType<typeof import('leaflet')['marker']> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;

    // If container already has a Leaflet instance, just update mapRef and return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((containerRef.current as any)._leaflet_id) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled) return;
      if (!containerRef.current) return;
      // Double-check after async gap
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((containerRef.current as any)._leaflet_id) return;

      // Fix default icon URLs for Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(containerRef.current!, {
        center,
        zoom,
        zoomControl: false,   // desabilita o padrão (topo-esquerdo)
        attributionControl: true,
      });

      // Adiciona zoom no canto inferior-esquerdo, longe do dropdown
      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Pan/zoom when center or zoom changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom]);

  // Update markers when tecnicos list changes
  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then((L) => {
      const map = mapRef.current!;

      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (clienteMarkerRef.current) {
        clienteMarkerRef.current.remove();
        clienteMarkerRef.current = null;
      }

      // Cliente marker (blue pin)
      if (clientePos) {
        const clienteIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:#0ea5e9;border:3px solid white;
            transform:rotate(-45deg);
            box-shadow:0 4px 12px rgba(14,165,233,0.6);
            display:flex;align-items:center;justify-content:center;">
            <div style="transform:rotate(45deg);color:white;font-size:14px;">📍</div>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const clienteMarker = L.marker([clientePos.lat, clientePos.lng], { icon: clienteIcon })
          .addTo(map)
          .bindPopup(`<b>📍 Cliente</b><br/><small>${clienteLabel.split(',')[0]}</small>`, { maxWidth: 200 });

        clienteMarkerRef.current = clienteMarker;
      }

      // Técnico markers
      tecnicos.forEach((t, idx) => {
        let icon;

        if (!searchMode) {
          // Modo inicial: pino estilo Google Maps colorido por categoria
          const catColor =
            t.categoria.includes('REDE PLUS') ? '#f59e0b'
            : t.categoria.includes('PSO')     ? '#38bdf8'
            : t.categoria === 'ATA'           ? '#f87171'
            : t.categoria === 'SPOT'          ? '#34d399'
            : '#94a3b8';

          icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:22px;height:30px;">
              <svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.4));">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${catColor}"/>
                <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
              </svg>
            </div>`,
            iconSize: [22, 30],
            iconAnchor: [11, 30],
            popupAnchor: [0, -30],
          });
        } else {
          // Modo busca: pino rankeado colorido
          const isRecomendado = idx === 0;
          const isSelected = t.id === selectedId;
          const bg = isRecomendado ? '#ef4444' : isSelected ? '#0ea5e9' : '#f59e0b';
          const shadow = isRecomendado ? 'rgba(239,68,68,0.5)' : isSelected ? 'rgba(14,165,233,0.5)' : 'rgba(245,158,11,0.4)';

          icon = L.divIcon({
            className: '',
            html: `<div style="position:relative;width:34px;height:44px;">
              <svg viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 3px 6px ${shadow});">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${bg}"/>
                <circle cx="12" cy="12" r="7" fill="white" opacity="0.95"/>
                <text x="12" y="16" text-anchor="middle" font-size="9" font-weight="bold" fill="${bg}" font-family="sans-serif">${idx + 1}</text>
              </svg>
            </div>`,
            iconSize: [34, 44],
            iconAnchor: [17, 44],
            popupAnchor: [0, -44],
          });
        }

        const nomeClean = t.nome.replace(/^(ATA\d+_|PSO_|SPOT_|PRP_BOSCH_|PRP_)/, '');
        const distText = t.distancia !== undefined
          ? (t.distancia < 10 ? `${t.distancia.toFixed(1)} km` : `${Math.round(t.distancia!)} km`)
          : '';
        const isRecomendado = searchMode && idx === 0;

        const marker = L.marker([t.lat, t.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:180px;padding:2px 0;">
              <div style="font-weight:700;font-size:12px;margin-bottom:5px;color:#1e293b;line-height:1.3;">
                ${isRecomendado ? '⭐ ' : ''}${nomeClean.substring(0, 55)}
              </div>
              <div style="display:inline-block;font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 7px;border-radius:99px;margin-bottom:4px;">${t.categoria}</div>
              ${distText ? `<div style="font-size:11px;color:#0284c7;font-weight:600;margin-top:3px;">📍 ${distText} em linha reta</div>` : ''}
              ${t.telefone ? `<div style="font-size:11px;color:#16a34a;margin-top:4px;font-weight:600;">📞 ${t.telefone}</div>` : ''}
              <div style="font-size:10px;color:#94a3b8;margin-top:5px;font-style:italic;">Clique no card para ver mais</div>
            </div>
          `, { maxWidth: 240 })
          .on('click', () => onSelectTecnico(t));

        markersRef.current.push(marker);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tecnicos, clientePos, clienteLabel, selectedId, searchMode]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: '320px', background: '#1e293b' }}
      />
    </>
  );
}
