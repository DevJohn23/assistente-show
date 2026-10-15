'use client';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ReactFlow, ReactFlowProvider, Handle, Position, Background, BackgroundVariant, Controls, MiniMap,
  BaseEdge, getSmoothStepPath, useReactFlow, type Node, type Edge, type NodeProps, type EdgeProps, type Viewport } from '@xyflow/react';
import { ArrowLeft, ArrowUpRight, Building2, ChevronDown, ChevronRight, Crosshair, Download, List, Mail, MapPin, Maximize2, Minimize2, Network, Phone, Search, Settings2, Users, X } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import { useOrganization, EmployeeAvatar } from './OrganizationProvider';
import { ancestorsOf, matchesEmployee, visibleEmployees } from '@/lib/organization';
import { CARD_HEIGHT, CARD_WIDTH, layoutOrganization } from '@/lib/organizationLayout';
import { organizationTransition, ORGANIZATION_TRANSITION_MS } from '@/lib/organizationTransition';
import { Department, Employee } from '@/types/organization';

type PersonNode = Node<{ employee: Employee; department?: Department; count: number; expanded: boolean;
  compact: boolean; context: boolean; onExpand: (id: string) => void }, 'person'>;
const PersonCard = memo(function PersonCard({ data, selected }: NodeProps<PersonNode>) {
  const { employee, department, count, expanded, onExpand } = data;
  const footerLabel = data.context ? 'Liderança · contexto' : employee.is_example ? 'Dados fictícios' : employee.unit;
  return <article className={`org-person ${!count && !footerLabel ? 'no-footer' : ''} ${selected ? 'is-selected' : ''} ${data.context ? 'is-context' : ''}`} style={{ '--department-color': department?.color || '#2563eb' } as React.CSSProperties}>
    <Handle type="target" position={data.compact ? Position.Left : Position.Top} />
    <div className="org-person-main"><EmployeeAvatar employee={employee} size={56} /><div className="org-person-copy">
      <strong title={employee.name}>{employee.name}</strong><span title={employee.job_title}>{employee.job_title}</span>
      <small className="org-department-tag">{department?.name || 'Sem departamento'}</small>
    </div></div>
    {(count > 0 || footerLabel) && <div className="org-person-footer">{count > 0 ? <button className="nodrag nopan" onClick={event => { event.stopPropagation(); onExpand(employee.id); }} aria-label={`${expanded ? 'Recolher' : 'Expandir'} equipe de ${employee.name}`} aria-expanded={expanded}>
      <Users size={13} />{count} {count === 1 ? 'liderado direto' : 'liderados diretos'}{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </button> : <span>{footerLabel}</span>}</div>}
    <Handle type="source" position={Position.Bottom} />
  </article>;
});
const nodeTypes = { person: PersonCard };
function OrganizationEdge(props: EdgeProps) {
  const busY = props.data?.busY as number | undefined;
  const [normal] = getSmoothStepPath(props);
  const path = typeof busY === 'number'
    ? `M ${props.sourceX},${props.sourceY} V ${busY} H ${props.targetX - 18} V ${props.targetY} H ${props.targetX}` : normal;
  return <BaseEdge id={props.id} path={path} style={props.style} />;
}
const edgeTypes = { organization: OrganizationEdge };

function Profile({ person, employees, departments, onSelect, onFocus, onClose, canManage }: {
  person: Employee; employees: Employee[]; departments: Department[]; onSelect: (id: string) => void;
  onFocus: (id: string) => void; onClose: () => void; canManage: boolean;
}) {
  const panel = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const media = matchMedia('(max-width: 767px)'); const update = () => setMobile(media.matches);
    media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; panel.current?.querySelector('button')?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, [mobile, person.id]);
  const manager = employees.find(e => e.id === person.manager_id);
  const direct = employees.filter(e => e.manager_id === person.id && e.status === 'active');
  const department = departments.find(d => d.id === person.department_id);
  return <aside ref={panel} className="org-profile" role={mobile ? 'dialog' : 'complementary'} aria-modal={mobile || undefined} aria-label={`Perfil de ${person.name}`} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    if (mobile && event.key === 'Tab') {
      const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('button, a[href]') || []);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }}>
    <div className="org-profile-heading"><span>PERFIL DO COLABORADOR</span><button className="ui-icon-button" onClick={onClose} aria-label="Fechar perfil"><X size={17} /></button></div>
    <div className="org-profile-identity"><EmployeeAvatar employee={person} size={72} /><div><h2>{person.name}</h2><p>{person.job_title}</p><span className="org-department-tag" style={{ '--department-color': department?.color } as React.CSSProperties}>{department?.name}</span></div></div>
    {person.is_example && <p className="org-note">Pessoa fictícia para demonstração.</p>}
    {person.unit && <p className="org-location"><MapPin size={14} />{person.unit}</p>}
    <div className="org-contacts">
      {person.email ? <a href={`mailto:${person.email}`}><Mail size={16} /><span>{person.email}</span></a> : <span className="org-muted">E-mail não informado</span>}
      {person.phone && <a href={`tel:${person.phone.replace(/[^+\d]/g, '')}`}><Phone size={16} /><span>{person.phone}</span></a>}
      {person.extension && <span className="org-muted">Ramal {person.extension}</span>}
    </div>
    <button className="org-button org-primary org-wide" onClick={() => onFocus(person.id)}><Crosshair size={16} />Focar nesta pessoa</button>
    <section><h3>Responde a</h3>{manager ? <button className="org-related" onClick={() => onSelect(manager.id)}><EmployeeAvatar employee={manager} size={36} /><span><strong>{manager.name}</strong><small>{manager.job_title}</small></span><ChevronRight size={16} /></button> : <p className="org-muted">Sem liderança cadastrada</p>}</section>
    <section><h3>Equipe direta <span className="org-count">{direct.length}</span></h3>{direct.length ? <div className="org-team-list">{direct.map(e => <button key={e.id} className="org-related" onClick={() => onSelect(e.id)}><EmployeeAvatar employee={e} size={30} /><span><strong>{e.name}</strong><small>{e.job_title}</small></span><ChevronRight size={14} /></button>)}</div> : <p className="org-muted">Sem liderados diretos</p>}</section>
    <section><h3>Atende</h3>{person.serves.length ? <div className="org-chips">{person.serves.map(s => <span key={s}>{s}</span>)}</div> : <p className="org-muted">Atendimentos ainda não informados</p>}</section>
    <section><h3>Atribuições</h3><p className={person.responsibilities ? 'org-responsibilities' : 'org-muted'}>{person.responsibilities || 'Atribuições ainda não informadas'}</p></section>
    {canManage && <Link className="org-text-link" href={`/organograma/gerenciar?editar=${encodeURIComponent(person.id)}`}>Editar colaborador <ArrowUpRight size={14} /></Link>}
  </aside>;
}

function Explorer() {
  const { employees, departments, canManage, loading, error, reload } = useOrganization();
  const flow = useReactFlow<PersonNode>();
  const [view, setView] = useState<'hierarchy' | 'areas' | 'list'>('hierarchy');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(true);
  const [expanded, setExpanded] = useState(new Set<string>());
  const [focusId, setFocusId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<PersonNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const renderedGraph = useRef<{ nodes: PersonNode[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const animateExpansion = useRef(false);
  const [layoutError, setLayoutError] = useState(false);
  const [layoutBusy, setLayoutBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const pendingCamera = useRef<{ id?: string; viewport?: Viewport; all?: boolean } | null>({ all: true });
  const history = useRef<{ expanded: Set<string>; department: string; query: string; selected: string | null; focusId: string | null; viewport: Viewport; profileOpen: boolean }[]>([]);
  const initialized = useRef(false);
  const names = useMemo(() => new Map(departments.map(d => [d.id, d.name])), [departments]);
  const active = useMemo(() => employees.filter(e => e.status === 'active'), [employees]);
  const person = active.find(e => e.id === selected);
  const matches = useMemo(() => active.filter(e => (!department || department === e.department_id) && matchesEmployee(e, query, names.get(e.department_id))), [active, department, query, names]);
  // Typing only updates suggestions. Selection explicitly reveals and navigates to a person.
  const visible = useMemo(() => visibleEmployees(active, expanded, focusId, department, '', names), [active, expanded, focusId, department, names]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReducedMotion(media.matches); update();
    media.addEventListener('change', update); return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!active.length || initialized.current) return;
    initialized.current = true;
    setExpanded(new Set(active.filter(e => !e.manager_id || !active.some(p => p.id === e.manager_id)).map(e => e.id)));
    if (matchMedia('(max-width: 700px)').matches) setView('list');
  }, [active]);
  const remember = () => {
    history.current.push({ expanded: new Set(expanded), department, query, selected, focusId, viewport: flow.getViewport(), profileOpen });
    if (history.current.length > 20) history.current.shift();
  };
  const selectPerson = (id: string, navigate = true) => {
    if (navigate) {
      remember(); pendingCamera.current = { id };
      setFocusId(null); setDepartment(''); setQuery('');
      setExpanded(prev => new Set([...prev, ...ancestorsOf(id, active)]));
    }
    setSelected(id); setProfileOpen(true); setSearchOpen(false);
    setAnnouncement(`Selecionado: ${active.find(e => e.id === id)?.name || ''}`);
  };
  const expand = useCallback((id: string) => {
    animateExpansion.current = true;
    pendingCamera.current = { id };
    setExpanded(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    setFocusId(null);
  }, []);
  useEffect(() => {
    let cancelled = false;
    let animationFrame = 0;
    const animate = animateExpansion.current && !reducedMotion && view === 'hierarchy';
    animateExpansion.current = false;
    setLayoutBusy(true); setLayoutError(false);
    void layoutOrganization(visible).then(positions => {
      if (cancelled) return;
      const ancestry = selected ? new Set([selected, ...ancestorsOf(selected, active)]) : new Set<string>();
      const nextNodes: PersonNode[] = visible.map(e => ({ id: e.id, type: 'person', position: positions.get(e.id) || { x: 0, y: 0 },
        selected: e.id === selected, width: CARD_WIDTH, height: CARD_HEIGHT,
        ariaLabel: `${e.name}, ${e.job_title}`, data: { employee: e, department: departments.find(d => d.id === e.department_id),
          count: active.filter(p => p.manager_id === e.id).length, expanded: expanded.has(e.id), compact: positions.get(e.id)?.compact || false,
          context: !!department && e.department_id !== department, onExpand: expand } }));
      const nextEdges: Edge[] = visible.filter(e => e.manager_id && positions.has(e.manager_id)).map(e => ({ id: `edge-${e.id}`, source: e.manager_id!, target: e.id, type: 'organization',
        data: { busY: positions.get(e.id)?.busY }, style: { stroke: ancestry.has(e.id) ? '#2563eb' : '#a6b5c8', strokeWidth: ancestry.has(e.id) ? 2 : 1.3 } }));
      const apply = (graph: { nodes: PersonNode[]; edges: Edge[] }) => {
        renderedGraph.current = graph; setNodes(graph.nodes); setEdges(graph.edges);
      };
      if (!animate || !renderedGraph.current.nodes.length) {
        apply({ nodes: nextNodes, edges: nextEdges }); setLayoutBusy(false); return;
      }
      const frame = organizationTransition(renderedGraph.current.nodes, nextNodes, renderedGraph.current.edges, nextEdges);
      const start = performance.now();
      apply(frame(0));
      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min(1, (now - start) / ORGANIZATION_TRANSITION_MS);
        apply(frame(progress));
        if (progress < 1) animationFrame = requestAnimationFrame(tick);
        else setLayoutBusy(false);
      };
      animationFrame = requestAnimationFrame(tick);
    }).catch(() => { if (!cancelled) { setLayoutError(true); setLayoutBusy(false); } });
    return () => { cancelled = true; cancelAnimationFrame(animationFrame); };
  }, [visible, departments, active, selected, expanded, department, expand, reducedMotion, view]);
  useEffect(() => {
    if (layoutBusy || !nodes.length || view !== 'hierarchy') return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = pendingCamera.current; pendingCamera.current = null;
      const duration = reducedMotion ? 0 : 420;
      if (!target) {
        const node = nodes.find(n => n.id === selected);
        const rect = root.current?.querySelector('.org-canvas')?.getBoundingClientRect();
        if (node && rect && profileOpen) {
          const point = flow.flowToScreenPosition(node.position), zoom = flow.getZoom();
          if (point.x < rect.left + 16 || point.x + CARD_WIDTH * zoom > rect.right - 16 || point.y < rect.top + 16 || point.y + CARD_HEIGHT * zoom > rect.bottom - 16) {
            void flow.setCenter(node.position.x + CARD_WIDTH / 2, node.position.y + CARD_HEIGHT / 2, { zoom, duration });
          }
        }
        return;
      }
      if (target.viewport) void flow.setViewport(target.viewport, { duration });
      else if (target.id) {
        const node = nodes.find(n => n.id === target.id);
        if (node) void flow.setCenter(node.position.x + CARD_WIDTH / 2, node.position.y + CARD_HEIGHT / 2, { zoom: Math.max(.85, Math.min(flow.getZoom(), 1.05)), duration });
      } else if (nodes.length > 10) {
        const canvas = root.current?.querySelector('.org-canvas');
        const width = canvas?.clientWidth || 900;
        const left = Math.min(...nodes.map(n => n.position.x));
        const right = Math.max(...nodes.map(n => n.position.x + CARD_WIDTH));
        const top = Math.min(...nodes.map(n => n.position.y));
        const zoom = Math.max(.75, Math.min(.95, (width - 80) / (right - left)));
        void flow.setViewport({ x: width / 2 - (left + right) / 2 * zoom, y: 48 - top * zoom, zoom }, { duration });
      } else void flow.fitView({ duration, padding: .18, minZoom: .75, maxZoom: 1 });
    }));
    return () => cancelAnimationFrame(raf);
  }, [nodes, layoutBusy, view, reducedMotion, flow, selected, profileOpen]);
  useEffect(() => {
    const changed = () => setFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', changed); return () => document.removeEventListener('fullscreenchange', changed);
  }, []);
  const focus = (id: string) => {
    remember(); setFocusId(id); setSelected(id); setView('hierarchy'); setDepartment(''); setSearchOpen(false); setQuery('');
    pendingCamera.current = { all: true };
    if (matchMedia('(max-width: 767px)').matches) setProfileOpen(false);
    setAnnouncement(`Modo foco: ${active.find(e => e.id === id)?.name}`);
  };
  const back = () => {
    const previous = history.current.pop(); if (!previous) return;
    pendingCamera.current = { viewport: previous.viewport };
    setExpanded(previous.expanded); setDepartment(previous.department); setQuery(previous.query); setSelected(previous.selected); setFocusId(previous.focusId);
    setProfileOpen(previous.profileOpen);
  };
  const overview = () => {
    remember(); pendingCamera.current = { all: true }; setFocusId(null); setDepartment(''); setSelected(null); setQuery('');
    setExpanded(new Set(active.filter(e => !e.manager_id || !active.some(p => p.id === e.manager_id)).map(e => e.id)));
  };
  const exportCsv = () => {
    const cell = (s: string) => `"${(/^[=+@\-\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
    const rows = [['Nome', 'Cargo', 'Departamento', 'Unidade', 'Liderança', 'E-mail', 'Telefone', 'Atende', 'Atribuições'],
      ...matches.map(e => [e.name, e.job_title, names.get(e.department_id) || '', e.unit, active.find(m => m.id === e.manager_id)?.name || '', e.email, e.phone, e.serves.join('; '), e.responsibilities])];
    const url = URL.createObjectURL(new Blob(['\ufeff' + rows.map(r => r.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'colaboradores.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (loading && !employees.length) return <div className="org-loading" role="status">Carregando a organização…</div>;
  if (error) return <div className="org-empty" role="alert"><h2>Não foi possível carregar o organograma</h2><p>Verifique a conexão e tente novamente.</p><button className="org-button" onClick={() => void reload()}>Tentar novamente</button></div>;
  return <div ref={root} className={`org-explorer ${fullScreen ? 'org-fullscreen' : ''}`}>
    <header className="org-header"><div><h1>Organograma</h1><p>Encontre pessoas e conheça nossa estrutura.</p></div>
      <div className="org-header-actions"><button className="org-button" onClick={exportCsv} disabled={!matches.length}><Download size={16} />Exportar CSV</button>{canManage && <Link className="org-button org-primary" href="/organograma/gerenciar"><Settings2 size={16} />Gerenciar</Link>}</div>
    </header>
    <div className="org-toolbar"><div className="org-tabs" aria-label="Visualização">{([{ id: 'hierarchy', label: 'Hierarquia', icon: Network }, { id: 'areas', label: 'Áreas', icon: Building2 }, { id: 'list', label: 'Lista', icon: List }] as const).map(({ id, label, icon: Icon }) => <button key={id} aria-pressed={view === id} onClick={() => { setView(id); if (id === 'hierarchy') pendingCamera.current = { all: true }; }}><Icon size={16} />{label}</button>)}</div>
      <div className="org-search"><Search size={17} /><input aria-label="Buscar pessoa, cargo ou atribuição" placeholder="Buscar pessoa, cargo ou atribuição…" value={query} onChange={e => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={e => { if (e.key === 'Escape') setSearchOpen(false); if (e.key === 'Enter' && matches.length) selectPerson(matches[0].id); }} />
        {query && <button aria-label="Limpar busca" onClick={() => { setQuery(''); setSearchOpen(false); }}><X size={15} /></button>}
        {searchOpen && query.trim() && view === 'hierarchy' && <div className="org-search-results" aria-label="Resultados da busca"><small>{matches.length} resultado(s)</small>{matches.slice(0, 8).map(e => <button key={e.id} onClick={() => selectPerson(e.id)}><EmployeeAvatar employee={e} size={32} /><span><strong>{e.name}</strong><small>{e.job_title}</small></span><ArrowUpRight size={14} /></button>)}{!matches.length && <p>Nenhuma pessoa encontrada.</p>}</div>}
      </div>
      <select className="org-input org-filter" aria-label="Filtrar departamento" value={department} onChange={e => { remember(); setDepartment(e.target.value); setFocusId(null); setSelected(null); }}><option value="">Todos os departamentos</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <button className="org-button org-fullscreen-button" aria-label={fullScreen ? 'Sair da tela cheia' : 'Tela cheia'} onClick={async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.current?.requestFullscreen(); } catch { setAnnouncement('Tela cheia indisponível neste navegador.'); } }}>{fullScreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button>
    </div>
    <div className="org-content"><div className="org-workspace">
      <div className="org-context-bar"><span><span className="org-live-dot" />{focusId ? `Em foco: ${person?.name || ''}` : department ? names.get(department) : 'Toda a empresa'} <small>· {active.length} colaboradores</small></span><div>{history.current.length > 0 && <button onClick={back}><ArrowLeft size={14} />Voltar</button>}<button onClick={overview}><Network size={14} />Visão geral</button></div></div>
      {view === 'hierarchy' ? <div className="org-canvas" onKeyDownCapture={event => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('react-flow__node') && (event.key === 'Enter' || event.key === ' ')) {
          const id = target.getAttribute('data-id');
          if (id) { event.preventDefault(); event.stopPropagation(); selectPerson(id, false); }
        }
      }}>
        {layoutError ? <div className="org-empty" role="alert">Não foi possível organizar o mapa.<button className="org-button" onClick={() => setView('list')}>Abrir lista de pessoas</button></div> : !active.length ? <div className="org-empty"><Users size={32} /><h2>Vamos conhecer a equipe?</h2><p>Cadastre o primeiro colaborador para começar.</p>{canManage && <Link className="org-button org-primary" href="/organograma/gerenciar">Cadastrar colaborador</Link>}</div> : !visible.length ? <div className="org-empty">Nenhuma pessoa neste departamento.</div> : <ReactFlow<PersonNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
          onNodeClick={(_, node) => selectPerson(node.id, false)} onPaneClick={() => setSearchOpen(false)}
          nodesDraggable={false} nodesConnectable={false} edgesFocusable={false} elementsSelectable deleteKeyCode={null} minZoom={.25} maxZoom={1.5}
          ariaLabelConfig={{ 'controls.zoomIn.ariaLabel': 'Aproximar', 'controls.zoomOut.ariaLabel': 'Afastar', 'controls.fitView.ariaLabel': 'Enquadrar organograma', 'minimap.ariaLabel': 'Visão geral do mapa' }}>
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--org-dot)" /><Controls showInteractive={false} fitViewOptions={{ duration: reducedMotion ? 0 : 420, maxZoom: 1 }} /><MiniMap pannable zoomable nodeColor={n => n.id === selected ? '#2563eb' : '#cbd5e1'} maskColor="rgba(148,163,184,.12)" />
        </ReactFlow>}
        {layoutBusy && <span className="org-layout-status" role="status">Organizando…</span>}
        <div className="org-map-legend"><span />Liderança direta <span className="org-legend-hint">Arraste para explorar · Use + e − para aproximar</span></div>
      </div> : <div className="org-directory">
        {!matches.length && <div className="org-empty">Nenhum colaborador encontrado. Ajuste a busca ou o departamento.</div>}
        {view === 'areas' ? departments.filter(d => !department || d.id === department).map(d => {
          const people = matches.filter(e => e.department_id === d.id); if (!people.length) return null;
          return <section className="org-area" key={d.id}><h2><span style={{ background: d.color }} />{d.name}<small>{people.length} pessoas</small></h2><div className="org-area-people">{people.map(e => <button key={e.id} className={`org-directory-person ${selected === e.id ? 'is-selected' : ''}`} onClick={() => selectPerson(e.id, false)}><EmployeeAvatar employee={e} /><span><strong>{e.name}</strong><small>{e.job_title}</small></span><ChevronRight size={16} /></button>)}</div></section>;
        }) : matches.map(e => <button key={e.id} className={`org-directory-person ${selected === e.id ? 'is-selected' : ''}`} onClick={() => selectPerson(e.id, false)}><EmployeeAvatar employee={e} /><span><strong>{e.name}</strong><small>{e.job_title}</small></span><span className="org-directory-dept">{names.get(e.department_id)}</span><ChevronRight size={16} /></button>)}
      </div>}
    </div>{person && profileOpen && <Profile person={person} employees={active} departments={departments} onSelect={id => { setView('hierarchy'); selectPerson(id); }} onFocus={focus} onClose={() => setSelected(null)} canManage={canManage} />}</div>
    <p className="org-sr-only" role="status" aria-live="polite">{announcement}</p>
  </div>;
}
export default function OrganizationExplorer() { return <ReactFlowProvider><Explorer /></ReactFlowProvider>; }
