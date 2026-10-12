'use client';

import React from 'react';
import { ArrowRight, ArrowUpRight, Plus, CalendarCheck } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { Opportunity, Commission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getLocalDateString } from '@/lib/dateUtils';
import { getMonthlyCommissionSummary } from '@/lib/dashboardSummary';

interface DashboardViewProps {
  opportunities: Opportunity[];
  commissions: Commission[];
  setActiveTab: (tab: string) => void;
  onNewOpportunity: () => void;
  onNewCommission: () => void;
  onOpenOpportunities: (filter: 'all' | 'today' | 'expired') => void;
  onOpenCommissions: () => void;
}
const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const DashboardView: React.FC<DashboardViewProps> = ({ opportunities, commissions, setActiveTab,
  onNewOpportunity, onNewCommission, onOpenOpportunities, onOpenCommissions }) => {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Vendedor';
  const firstName = name.trim().split(' ')[0];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 || hour >= 18 ? 'Boa noite' : hour < 12 ? 'Bom dia' : 'Boa tarde';
  const today = getLocalDateString(now);
  const month = today.slice(0, 7);
  const monthly = commissions.filter(c => c.sale_date.slice(0, 7) === month);
  const { salesCount, expectedCommission } = getMonthlyCommissionSummary(commissions, now);
  const own = monthly.filter(c => c.registration_type === 'own').reduce((s, c) => s + c.commission_amount, 0);
  const receive = monthly.filter(c => c.registration_type === 'other_implanted_for_me').reduce((s, c) => s + c.commission_amount, 0);
  const transfer = monthly.filter(c => c.registration_type === 'implanted_for_other').reduce((s, c) => s + c.commission_amount, 0);
  const pending = opportunities.filter(o => o.status !== 'won' && o.status !== 'lost');
  const due = pending.filter(o => o.expiration_date === today);
  const overdue = pending.filter(o => o.expiration_date < today);
  const priority = [...overdue, ...due].sort((a, b) => a.expiration_date.localeCompare(b.expiration_date)).slice(0, 5);
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const stats = [
    { label: 'Vendas no mês', value: String(salesCount), action: onOpenCommissions },
    { label: 'Comissão prevista', value: money(expectedCommission), action: onOpenCommissions },
    { label: 'Vencem hoje', value: String(due.length), action: () => onOpenOpportunities('today') },
    { label: 'Vencidas', value: String(overdue.length), action: () => onOpenOpportunities('expired'), warning: overdue.length > 0 },
  ];
  return <div className="dashboard-view">
    <header className="dashboard-header">
      <div><h1>{greeting}, {firstName}</h1><p className="ui-muted mt-2">Confira seu mês e organize os próximos contatos.</p></div>
      <time className="ui-muted text-sm" dateTime={today}>{now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
    </header>
    <div className="dashboard-actions">
      <button className="ui-button ui-button-primary" onClick={() => setActiveTab('catalog')}><Plus size={18} />Montar orçamento</button>
      <button className="ui-button ui-button-secondary" onClick={onNewCommission}><Plus size={18} />Cadastrar venda</button>
      <button className="ui-button ui-button-secondary" onClick={onNewOpportunity}><Plus size={18} />Nova oportunidade</button>
    </div>
    <section aria-labelledby="overview-title">
      <div className="dashboard-section-heading"><h2 id="overview-title">Visão geral</h2><span className="ui-muted text-sm capitalize">{monthLabel}</span></div>
      <div className="dashboard-stats">{stats.map(stat => <button key={stat.label} className="dashboard-stat" onClick={stat.action}
        aria-label={`${stat.label}: ${stat.value}. Ver detalhes`}>
        <span className="flex items-center justify-between gap-2"><span className="font-medium">{stat.label}</span><ArrowUpRight size={16} className="ui-muted" /></span>
        <strong className={stat.warning ? 'stat-warning' : ''}>{stat.value}</strong>
      </button>)}</div>
    </section>
    <div className="dashboard-details">
      <section className="ui-panel" aria-labelledby="contacts-title">
        <div className="panel-heading"><div><h2 id="contacts-title">Contatos prioritários</h2><p className="ui-muted text-sm mt-1">Pendências e vencimentos de hoje</p></div>
          <button className="ui-text-button shrink-0" onClick={() => onOpenOpportunities('all')}>Ver todas <ArrowRight size={16} /></button></div>
        {priority.length === 0 ? <div className="dashboard-empty"><CalendarCheck size={28} strokeWidth={1.5} /><p className="font-medium">Nenhuma pendência para hoje</p><p className="ui-muted text-sm">Os demais clientes estão em Oportunidades.</p></div>
        : <ul className="contact-list">{priority.map(opp => {
          const late = opp.expiration_date < today;
          const phone = opp.phone.replace(/\D/g, '');
          const whatsapp = phone.startsWith('55') && phone.length >= 12 ? phone : `55${phone}`;
          return <li key={opp.id}>
            <div className="min-w-0"><p className="font-semibold break-words">{opp.client_name}</p><p className="ui-muted text-sm mt-1">{opp.type === 'PJ' ? 'Pessoa jurídica' : 'Pessoa física'}</p></div>
            <span className={`status-badge ${late ? 'status-warning' : 'status-info'}`}>{late ? `Venceu em ${new Date(opp.expiration_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'Vence hoje'}</span>
            {phone ? <a className="ui-button ui-button-secondary contact-action" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp de ${opp.client_name}`}><WhatsAppIcon size={17} /><span>WhatsApp</span></a> : <span className="ui-muted text-xs">Sem telefone</span>}
          </li>;
        })}</ul>}
        {overdue.length + due.length > 5 && <p className="ui-muted text-xs px-5 py-3">Mostrando 5 de {overdue.length + due.length} contatos prioritários.</p>}
      </section>
      <section className="ui-panel commission-overview" aria-labelledby="commission-title">
        <div className="panel-heading"><h2 id="commission-title">Comissões do mês</h2></div>
        <div className="commission-overview-body"><dl className="commission-breakdown">
          <div><dt>Próprias</dt><dd>{money(own)}</dd></div><div><dt>A receber</dt><dd>{money(receive)}</dd></div><div><dt>A repassar</dt><dd>{money(transfer)}</dd></div>
        </dl><div className="commission-net"><p className="font-medium">Saldo líquido previsto</p><strong>{money(expectedCommission - transfer)}</strong><p className="ui-muted text-sm">Comissão prevista menos repasses</p></div>
        <button className="ui-text-button mt-5" onClick={onOpenCommissions}>Abrir comissões <ArrowRight size={16} /></button></div>
      </section>
    </div>
  </div>;
};
