'use client';
import { getLocalDateString } from "@/lib/dateUtils";

import React, { useState } from 'react';
import { usePendingAction } from '@/lib/usePendingAction';
import { Opportunity, ClientType } from '@/types';
import { 
  Search, 
  Plus, 
  Download, 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  Edit2, 
  RefreshCw, 
  Trash2, 
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WhatsAppIcon } from './WhatsAppIcon';
import { QuoteDialog } from './QuoteControls';

interface OpportunitiesViewProps {
  initialFilter?: 'all' | 'today' | 'expired';
  opportunities: Opportunity[];
  onAddOpportunity: (opp: Omit<Opportunity, 'id' | 'user_id'>) => Promise<boolean>;
  onEditOpportunity: (id: string, updated: Partial<Opportunity>) => Promise<boolean>;
  onDeleteOpportunity: (id: string) => Promise<boolean>;
  onRenewOpportunity: (id: string) => Promise<boolean>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  initialFilter = 'all',
  onAddOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onRenewOpportunity,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { isPending, run } = usePendingAction();
  const [formError, setFormError] = useState('');
  const [notesOpp, setNotesOpp] = useState<Opportunity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  // Edit & Delete state
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renewingOpp, setRenewingOpp] = useState<Opportunity | null>(null);

  const calcExpirationDate = (clientType: ClientType, startDateStr: string) => {
    if (!startDateStr) return '';
    const days = clientType === 'PF' ? 15 : 30;
    const d = new Date(startDateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return getLocalDateString(d);
  };

  // Form State
  const initialToday = getLocalDateString();
  const [formData, setFormData] = useState({
    client_name: '',
    cpf_cnpj: '',
    type: 'PF' as ClientType,
    phone: '',
    company_name: '',
    registration_date: initialToday,
    expiration_date: calcExpirationDate('PF', initialToday),
    notes: '',
  });

  const handleOpenAddModal = () => {
    setFormError('');
    setEditingOpp(null);
    const today = getLocalDateString();
    setFormData({
      client_name: '',
      cpf_cnpj: '',
      type: 'PF',
      phone: '',
      company_name: '',
      registration_date: today,
      expiration_date: calcExpirationDate('PF', today),
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (opp: Opportunity) => {
    setFormError('');
    setEditingOpp(opp);
    setFormData({
      client_name: opp.client_name,
      cpf_cnpj: opp.cpf_cnpj,
      type: opp.type,
      phone: opp.phone,
      company_name: opp.company_name || '',
      registration_date: opp.registration_date,
      expiration_date: opp.expiration_date,
      notes: opp.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.phone) return;
    await run(async () => {
      setFormError('');
      const saved = editingOpp
        ? await onEditOpportunity(editingOpp.id, formData)
        : await onAddOpportunity({ ...formData, status: 'active' });
      if (saved) setIsModalOpen(false);
      else setFormError('Não foi possível salvar. Seus dados foram mantidos para tentar novamente.');
      return saved;
    });
  };

  // Date filters logic
  const todayStr = getLocalDateString();
  const tomorrowStr = getLocalDateString(new Date(Date.now() + 1 * 86400000));
  const twoDaysStr = getLocalDateString(new Date(Date.now() + 2 * 86400000));

  // Filtering
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = 
      opp.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opp.company_name && opp.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      opp.cpf_cnpj.includes(searchTerm) ||
      opp.phone.includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeFilter === 'PF') return opp.type === 'PF';
    if (activeFilter === 'PJ') return opp.type === 'PJ';
    if (activeFilter === 'today') return opp.expiration_date === todayStr && opp.status !== 'won' && opp.status !== 'lost';
    if (activeFilter === 'tomorrow') return opp.expiration_date === tomorrowStr;
    if (activeFilter === 'twoDays') return opp.expiration_date === twoDaysStr;
    if (activeFilter === 'thisWeek') {
      const exp = new Date(opp.expiration_date).getTime();
      const now = new Date().getTime();
      const diffDays = (exp - now) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (activeFilter === 'expired') return opp.expiration_date < todayStr && opp.status !== 'won' && opp.status !== 'lost';

    return true;
  });

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredOpportunities.map((o) => ({
      Nome: o.client_name,
      Empresa: o.company_name || 'N/A',
      'CPF/CNPJ': o.cpf_cnpj,
      Tipo: o.type,
      Telefone: o.phone,
      'Data Cadastro': o.registration_date,
      'Data Vencimento': o.expiration_date,
      Observações: o.notes || '',
      Status: o.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Oportunidades');
    XLSX.writeFile(workbook, `Oportunidades_Assistente_Show_${todayStr}.xlsx`);
  };

  const dateLabel = (date: string) => date.split('-').reverse().join('/');
  const filters = [
    ['all','Todos'],['PF','Pessoa física'],['PJ','Pessoa jurídica'],['today','Vencem hoje'],
    ['tomorrow','Vencem amanhã'],['twoDays','Vencem em 2 dias'],['thisWeek','Esta semana'],['expired','Vencidas'],
  ];
  const situation = (opp: Opportunity) => {
    if (opp.status === 'won') return { label: 'Ganha', tone: 'won' };
    if (opp.status === 'lost') return { label: 'Perdida', tone: 'closed' };
    if (opp.expiration_date < todayStr) return { label: 'Vencida', tone: 'expired' };
    if (opp.expiration_date === todayStr) return { label: 'Vence hoje', tone: 'today' };
    return { label: 'No prazo', tone: 'active' };
  };
  const actions = (opp: Opportunity) => <div className="opportunity-actions">
    <a className="ui-icon-button opportunity-whatsapp" href={`https://wa.me/55${opp.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="Abrir no WhatsApp" aria-label={`WhatsApp de ${opp.client_name}`}><WhatsAppIcon size={17} /></a>
    <button className="ui-icon-button" title={`Renovar Oportunidade (+${opp.type === 'PF' ? '15' : '30'} dias)`} aria-label={`Renovar ${opp.client_name}`} onClick={() => { setFormError(''); setRenewingOpp(opp); }}><RefreshCw size={17} /></button>
    <button className="ui-icon-button" title="Editar Oportunidade" aria-label={`Editar ${opp.client_name}`} onClick={() => handleOpenEditModal(opp)}><Edit2 size={17} /></button>
    <button className="ui-icon-button opportunity-delete" title="Excluir Oportunidade" aria-label={`Excluir ${opp.client_name}`} onClick={() => { setFormError(''); setDeletingId(opp.id); }}><Trash2 size={17} /></button>
  </div>;
  const badge = (opp: Opportunity) => { const state = situation(opp); return <span className={`opportunity-status status-${state.tone}`}>{state.label}</span>; };
  return <div className="opportunities-page">
    <header className="commissions-heading"><div><h1>Oportunidades</h1><p className="ui-muted">Organize seus contatos e acompanhe os vencimentos.</p></div><button className="ui-button ui-button-primary" onClick={handleOpenAddModal}><Plus size={18} />Nova Oportunidade</button></header>
    <section className="ui-panel opportunity-filters" aria-label="Filtros de oportunidades">
      <div className="commission-search-row"><label className="commission-search"><Search size={18} /><input className="ui-input" aria-label="Pesquisar oportunidades" placeholder="Pesquisar por Nome, Empresa, CPF/CNPJ ou Telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><button className="ui-button ui-button-secondary" disabled={!filteredOpportunities.length} onClick={handleExportExcel} title="Exportar os registros filtrados"><Download size={17} />Exportar Excel</button></div>
      <div className="opportunity-filter-row"><div className="opportunity-filter-options" role="group" aria-label="Filtrar oportunidades">{filters.map(([id,label]) => <button className="ui-button ui-button-secondary" key={id} aria-pressed={activeFilter === id} onClick={() => setActiveFilter(id)}>{label}</button>)}</div>{(searchTerm || activeFilter !== 'all') && <button className="auth-text-button" onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}>Limpar filtros</button>}</div>
    </section>
    <section className="ui-panel opportunity-records" aria-label="Registros de oportunidades">
      <header className="opportunity-results-header"><span>{filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'oportunidade' : 'oportunidades'}</span><div className="opportunity-view-options" role="group" aria-label="Visualização"><button aria-pressed={viewMode === 'table'} onClick={() => setViewMode('table')}><TableIcon size={16} />Tabela</button><button aria-pressed={viewMode === 'calendar'} onClick={() => setViewMode('calendar')}><CalendarIcon size={16} />Por vencimento</button></div></header>
      {!filteredOpportunities.length ? <div className="commission-empty"><CalendarIcon size={30} /><h2>{opportunities.length ? 'Nenhuma oportunidade encontrada' : 'Sua carteira começa aqui'}</h2><p>{opportunities.length ? 'Ajuste a busca ou os filtros para consultar outros contatos.' : 'Cadastre um contato para acompanhar o prazo de renovação.'}</p><button className="ui-button ui-button-secondary" onClick={opportunities.length ? () => { setSearchTerm(''); setActiveFilter('all'); } : handleOpenAddModal}>{opportunities.length ? 'Limpar filtros' : 'Cadastrar oportunidade'}</button></div> : viewMode === 'table' ? <div className="commission-table-wrap"><table className="commission-table opportunity-table"><thead><tr><th>Cliente / empresa</th><th>Contato / documento</th><th>Vencimento</th><th>Observações</th><th>Ações</th></tr></thead><tbody>{filteredOpportunities.map(opp => <tr key={opp.id}>
        <td data-label="Cliente"><strong>{opp.client_name}</strong><div className="opportunity-secondary">{opp.type}{opp.company_name ? ` · ${opp.company_name}` : ''}</div></td>
        <td data-label="Contato"><div>{opp.phone}<div className="opportunity-secondary">{opp.cpf_cnpj}</div></div></td>
        <td data-label="Vencimento"><div><div className="opportunity-date">{dateLabel(opp.expiration_date)}</div>{badge(opp)}</div></td>
        <td data-label="Observações"><button className="commission-note" aria-label={`Observações de ${opp.client_name}`} onClick={() => setNotesOpp(opp)}><span>{opp.notes || 'Sem observações'}</span></button></td>
        <td data-label="Ações">{actions(opp)}</td>
      </tr>)}</tbody></table></div> : <div className="opportunity-cards">{[...filteredOpportunities].sort((a,b) => a.expiration_date.localeCompare(b.expiration_date)).map(opp => <article key={opp.id}><header><span>{dateLabel(opp.expiration_date)}</span>{badge(opp)}</header><button className="opportunity-card-title" onClick={() => handleOpenEditModal(opp)}>{opp.client_name}</button><p className="opportunity-secondary">{opp.type}{opp.company_name ? ` · ${opp.company_name}` : ''}</p><p>{opp.phone}</p><button className="commission-note" aria-label={`Observações de ${opp.client_name}`} onClick={() => setNotesOpp(opp)}><span>{opp.notes || 'Sem observações'}</span></button>{actions(opp)}</article>)}</div>}
    </section>
    {isModalOpen && <QuoteDialog className="commission-editor" label={editingOpp ? 'Editar Oportunidade' : 'Nova Oportunidade'} onClose={() => setIsModalOpen(false)} canClose={!isPending}>
      <header className="commission-editor-header"><div><h2>{editingOpp ? 'Editar oportunidade' : 'Nova oportunidade'}</h2><p className="ui-muted">Dados do contato e prazo para renovação.</p></div><button className="ui-icon-button" aria-label="Fechar oportunidade" disabled={isPending} onClick={() => setIsModalOpen(false)}><X size={20} /></button></header>
      <form className="commission-form" onSubmit={handleFormSubmit}><fieldset className="commission-form-body" disabled={isPending}>
        <label className="quote-field">Nome do cliente *<input className="ui-input" required placeholder="ex: Transportadora Alfa" value={formData.client_name} onChange={e => setFormData({...formData,client_name:e.target.value})} /></label>
        <div className="commission-form-grid"><label className="quote-field">Tipo de pessoa<select className="ui-input" aria-label="Tipo de pessoa" value={formData.type} onChange={e => { const type=e.target.value as ClientType; setFormData({...formData,type,expiration_date:calcExpirationDate(type,formData.registration_date)}); }}><option value="PF">Pessoa física (15 dias)</option><option value="PJ">Pessoa jurídica (30 dias)</option></select></label><label className="quote-field">CPF ou CNPJ *<input className="ui-input" required value={formData.cpf_cnpj} onChange={e => setFormData({...formData,cpf_cnpj:e.target.value})} /></label></div>
        <div className="commission-form-grid"><label className="quote-field">Telefone / WhatsApp *<input className="ui-input" type="tel" required placeholder="11999998888" value={formData.phone} onChange={e => setFormData({...formData,phone:e.target.value})} /></label><label className="quote-field">Empresa (opcional)<input className="ui-input" value={formData.company_name} onChange={e => setFormData({...formData,company_name:e.target.value})} /></label></div>
        <div className="commission-form-grid"><label className="quote-field">Data de cadastro<input className="ui-input" type="date" required value={formData.registration_date} onChange={e => setFormData({...formData,registration_date:e.target.value,expiration_date:calcExpirationDate(formData.type,e.target.value)})} /></label><label className="quote-field">Data de vencimento *<input className="ui-input" type="date" required value={formData.expiration_date} onChange={e => setFormData({...formData,expiration_date:e.target.value})} /></label></div>
        <p className="auth-hint">Prazo sugerido: {formData.type === 'PF' ? '15' : '30'} dias após o cadastro. Você pode ajustar o vencimento.</p>
        <label className="quote-field">Observações<textarea className="ui-input" rows={3} placeholder="Ex: Cliente pediu retorno semana que vem..." value={formData.notes} onChange={e => setFormData({...formData,notes:e.target.value})} /></label>
      </fieldset><footer className="commission-form-footer">{formError && <p className="quote-error" role="alert">{formError}</p>}<div><button className="ui-button ui-button-secondary" type="button" disabled={isPending} onClick={() => setIsModalOpen(false)}>Cancelar</button><button className="ui-button ui-button-primary" disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar Registro'}</button></div></footer></form>
    </QuoteDialog>}
    {notesOpp && <QuoteDialog label="Observações da oportunidade" onClose={() => setNotesOpp(null)}><div className="quote-preview"><header className="quote-modal-heading"><div><h2>Observações</h2><p className="ui-muted">{notesOpp.client_name}</p></div><button className="ui-icon-button" aria-label="Fechar observações" onClick={() => setNotesOpp(null)}><X size={20} /></button></header><p className="commission-notes-text">{notesOpp.notes || 'Nenhuma observação informada.'}</p><footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" onClick={() => setNotesOpp(null)}>Fechar</button><button className="ui-button ui-button-primary" onClick={() => { handleOpenEditModal(notesOpp); setNotesOpp(null); }}>Editar oportunidade</button></footer></div></QuoteDialog>}
    {(renewingOpp || deletingId) && <QuoteDialog label={renewingOpp ? 'Renovar Oportunidade' : 'Excluir Oportunidade'} canClose={!isPending} onClose={() => { setRenewingOpp(null); setDeletingId(null); }}><div className="quote-preview"><h2>{renewingOpp ? 'Renovar oportunidade?' : 'Excluir oportunidade?'}</h2><p className="ui-muted my-4">{renewingOpp ? `Renovar o prazo de ${renewingOpp.client_name} (${renewingOpp.type}) por ${renewingOpp.type === 'PF' ? 15 : 30} dias a partir do vencimento atual (${dateLabel(renewingOpp.expiration_date)})?` : `Remover ${opportunities.find(opp => opp.id === deletingId)?.client_name} da sua carteira?`}</p>{formError && <p className="quote-error" role="alert">{formError}</p>}<footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" disabled={isPending} onClick={() => { setRenewingOpp(null); setDeletingId(null); }}>Cancelar</button><button className={`ui-button ${renewingOpp ? 'ui-button-primary' : 'commission-danger'}`} disabled={isPending} onClick={async () => { const saved=await run(() => renewingOpp ? onRenewOpportunity(renewingOpp.id) : onDeleteOpportunity(deletingId!)); if(saved) { setRenewingOpp(null); setDeletingId(null); } else setFormError('Não foi possível concluir. Tente novamente.'); }}>{isPending ? 'Aguarde...' : 'Confirmar'}</button></footer></div></QuoteDialog>}
  </div>;
};
