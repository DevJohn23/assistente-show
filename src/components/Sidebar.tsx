'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, FileText, ChartNoAxesColumn, CalendarClock, MapPin, Settings,
  ChevronsLeft, ChevronsRight, ChevronDown, LogOut, Menu, X, Network } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { AccountView } from './AccountView';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  opportunitiesCountToday: number;
}
const navigation = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'catalog', label: 'Orçamentos', icon: FileText },
  { id: 'commissions', label: 'Comissões', icon: ChartNoAxesColumn },
  { id: 'opportunities', label: 'Oportunidades', icon: CalendarClock },
  { id: 'tecnicos', label: 'Rede técnica', icon: MapPin },
  { id: 'organograma', label: 'Organograma', icon: Network },
];

function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user, isAdmin, signOut } = useAuth();
  const { preference, setTheme } = useTheme();
  const [showAccount, setShowAccount] = useState(false);
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const select = useRef<HTMLSelectElement>(null);
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Vendedor';
  useEffect(() => {
    if (!open) return;
    select.current?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    const element = root.current;
    element?.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); element?.removeEventListener('keydown', escape); };
  }, [open]);
  return <div ref={root} className="account-root" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
  }}>
    {showAccount && <AccountView onClose={() => { setShowAccount(false); trigger.current?.focus(); }} />}
    {open && <section aria-label="Opções da conta" className={`account-panel ${compact ? 'account-panel-compact' : ''}`}>
      <p className="font-semibold truncate">{name}</p>
      <p className="ui-muted text-xs break-all mb-4">{user?.email}</p>
      <button className="ui-button ui-button-secondary w-full mb-4" onClick={() => { setOpen(false); setShowAccount(true); }}>Minha conta</button>
      <label className="block text-sm font-medium mb-2" htmlFor={compact ? 'theme-compact' : 'theme-expanded'}>Tema</label>
      <select ref={select} id={compact ? 'theme-compact' : 'theme-expanded'} className="ui-input w-full" value={preference}
        onChange={(event) => setTheme(event.target.value as 'light' | 'dark' | 'system')}>
        <option value="light">Claro</option><option value="dark">Escuro</option><option value="system">Automático</option>
      </select>
      <button className="ui-button ui-button-secondary mt-4 w-full" disabled={leaving} onClick={async () => {
        setLeaving(true); setError(false);
        try { await signOut(); } catch { setError(true); } finally { setLeaving(false); }
      }}><LogOut size={16} />{leaving ? 'Saindo…' : 'Sair da conta'}</button>
      {error && <p role="alert" className="text-sm text-red-600 mt-2">Não foi possível sair. Tente novamente.</p>}
    </section>}
    <button ref={trigger} className="account-trigger" aria-label="Abrir opções da conta" aria-expanded={open}
      onClick={() => setOpen(!open)} title={compact ? 'Minha conta' : undefined}>
      <span className="account-avatar">{name.charAt(0).toUpperCase()}</span>
      {!compact && <><span className="min-w-0 flex-1 text-left"><span className="block truncate font-medium">{name}</span>
        <span className="block ui-muted text-xs">{isAdmin ? 'Administrador' : 'Vendedor'}</span></span><ChevronDown size={16} /></>}
    </button>
  </div>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, opportunitiesCountToday }) => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    try { setCollapsed(localStorage.getItem('omnilink_sidebar_collapsed') === 'true'); } catch { /* Optional preference. */ }
    const media = window.matchMedia('(min-width: 768px)');
    const close = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  const toggle = () => {
    const next = !collapsed; setCollapsed(next);
    try { localStorage.setItem('omnilink_sidebar_collapsed', String(next)); } catch { /* Optional persistence. */ }
  };
  const content = (mobile: boolean) => {
    const compact = collapsed && !mobile;
    return <>
      <div className={`sidebar-brand ${compact ? 'sidebar-brand-compact' : ''}`}>
        {!compact && <button className="brand-signature text-left" onClick={() => { setActiveTab('dashboard'); dialog.current?.close(); }} aria-label="Assistente Omnilink — início">
          <span className="block">omnilink<span className="brand-dot">.</span></span><small>Assistente comercial</small>
        </button>}
        <button className="ui-icon-button shrink-0" onClick={mobile ? () => dialog.current?.close() : toggle}
          aria-label={mobile ? 'Fechar menu' : compact ? 'Expandir menu' : 'Recolher menu'} aria-expanded={mobile || !collapsed}
          title={mobile ? 'Fechar menu' : compact ? 'Expandir menu' : 'Recolher menu'}>
          {mobile ? <X size={18} /> : compact ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>
      <nav aria-label="Navegação principal" className="sidebar-navigation">
        {navigation.map(({ id, label, icon: Icon }) => <button key={id} aria-label={label} aria-current={activeTab === id ? 'page' : undefined}
          title={compact ? label : undefined} className={`sidebar-link ${activeTab === id ? 'is-active' : ''} ${compact ? 'justify-center' : ''}`}
          onClick={() => { if (id === 'organograma') router.push('/organograma'); else setActiveTab(id); dialog.current?.close(); }}>
          <Icon size={20} strokeWidth={1.7} />{!compact && <span>{label}</span>}
          {!compact && id === 'opportunities' && opportunitiesCountToday > 0 && <span className="sidebar-count">{opportunitiesCountToday}</span>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        {isAdmin && <button className={`sidebar-link ${compact ? 'justify-center' : ''}`} aria-label="Administração" title={compact ? 'Administração' : undefined}
          onClick={() => { dialog.current?.close(); router.push('/admin'); }}><Settings size={20} strokeWidth={1.7} />{!compact && <span>Administração</span>}</button>}
        <AccountMenu compact={compact} />
      </div>
    </>;
  };
  return <>
    <div className="mobile-navigation md:hidden">
      <button className="font-semibold text-lg" onClick={() => setActiveTab('dashboard')}>omnilink<span className="brand-dot">.</span></button>
      <button ref={mobileTrigger} className="ui-icon-button" aria-label="Abrir menu" onClick={() => dialog.current?.showModal()}><Menu size={22} /></button>
    </div>
    <aside className={`desktop-sidebar hidden md:flex ${collapsed ? 'is-collapsed' : ''}`}>{content(false)}</aside>
    <dialog ref={dialog} className="mobile-sidebar" aria-label="Menu de navegação" onClose={() => mobileTrigger.current?.focus()}
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="mobile-sidebar-content">{content(true)}</div>
    </dialog>
  </>;
};
