'use client';
import { getLocalDateString } from "@/lib/dateUtils";

import React, { useState } from 'react';
import { usePendingAction } from '@/lib/usePendingAction';
import { Commission, CommissionRegistrationType } from '@/types';
import { Search, Plus, Download, Trash2, Edit2, X, UserPlus, FileText, Coins } from 'lucide-react';
import * as XLSX from 'xlsx';
import { QuoteDialog } from './QuoteControls';

interface CommissionsViewProps {
  initialPeriod?: { start: string; end: string };
  commissions: Commission[];
  sellers: string[];
  onAddSeller: (name: string) => Promise<boolean>;
  onAddCommission: (comm: Omit<Commission, 'id' | 'user_id'>) => Promise<boolean>;
  onEditCommission: (id: string, updated: Partial<Commission>) => Promise<boolean>;
  onDeleteCommission: (id: string) => Promise<boolean>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({
  commissions,
  initialPeriod,
  sellers,
  onAddSeller,
  onAddCommission,
  onEditCommission,
  onDeleteCommission,
  isModalOpen,
  setIsModalOpen,
}) => {
  const { isPending, run } = usePendingAction();
  const [formError, setFormError] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(initialPeriod?.start ?? '');
  const [endDate, setEndDate] = useState(initialPeriod?.end ?? '');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Edit State
  const [editingComm, setEditingComm] = useState<Commission | null>(null);
  const [viewingNotesComm, setViewingNotesComm] = useState<Commission | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [saleDate, setSaleDate] = useState(getLocalDateString());
  
  // Single explicit operation type to eliminate invalid combinations
  const [regTypeSelect, setRegTypeSelect] = useState<CommissionRegistrationType>('own');
  
  // Seller selection state
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [newSellerInput, setNewSellerInput] = useState('');
  const [isAddingNewSellerInline, setIsAddingNewSellerInline] = useState(false);

  const [notes, setNotes] = useState('');

  // Combine default sellers with any extra sellers from existing commissions
  const allSellers = Array.from(
    new Set([
      ...sellers,
      ...commissions.map((c) => c.other_installer_name).filter(Boolean) as string[],
    ])
  ).sort();

  // Open modal for Adding new sale
  const handleOpenAddModal = () => {
    setFormError('');
    setEditingComm(null);
    setClientName('');
    setSaleAmount('');
    setCommissionAmount('');
    setSaleDate(getLocalDateString());
    setRegTypeSelect('own');
    setSelectedSeller(allSellers[0] || '');
    setNewSellerInput('');
    setIsAddingNewSellerInline(false);
    setNotes('');
    setIsModalOpen(true);
  };

  // Open modal for Editing existing sale
  const handleOpenEditModal = (comm: Commission) => {
    setFormError('');
    setEditingComm(comm);
    setClientName(comm.client_name);
    setSaleAmount(comm.sale_amount.toString());
    setCommissionAmount(comm.commission_amount.toString());
    setSaleDate(comm.sale_date);
    setRegTypeSelect(comm.registration_type);
    
    const currentSellerName = comm.other_installer_name || '';
    if (currentSellerName && !allSellers.includes(currentSellerName)) {
      setSelectedSeller('NEW');
      setNewSellerInput(currentSellerName);
      setIsAddingNewSellerInline(true);
    } else {
      setSelectedSeller(currentSellerName || (allSellers[0] || ''));
      setNewSellerInput('');
      setIsAddingNewSellerInline(false);
    }

    setNotes(comm.notes || '');
    setIsModalOpen(true);
  };

  // Handle explicit confirmation of new seller button
  const handleConfirmNewSeller = async () => {
    const trimmed = newSellerInput.trim();
    if (trimmed) {
      if (!await run(() => onAddSeller(trimmed))) { setFormError('Não foi possível cadastrar o vendedor. Tente novamente.'); return; }
      setFormError('');
      setSelectedSeller(trimmed);
      setIsAddingNewSellerInline(false);
      setNewSellerInput('');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericSale = parseFloat(saleAmount) || 0;
    const numericComm = parseFloat(commissionAmount) || 0;

    if (!clientName.trim()) return;

    let finalOtherInstaller: string | undefined = undefined;
    if (regTypeSelect === 'implanted_for_other' || regTypeSelect === 'other_implanted_for_me') {
      if (isAddingNewSellerInline) {
        finalOtherInstaller = newSellerInput.trim() || undefined;
      } else {
        finalOtherInstaller = selectedSeller || undefined;
      }
    }

    const installerOpt = regTypeSelect === 'implanted_for_other' ? 'me' : 'other';

    await run(async () => {
      setFormError('');
      const save = async () => {
        if (editingComm) {
          return onEditCommission(editingComm.id, {
            client_name: clientName,
            sale_amount: numericSale,
            commission_amount: numericComm,
            sale_date: saleDate,
            installer_option: installerOpt,
            registration_type: regTypeSelect,
            other_installer_name: finalOtherInstaller,
            notes: notes || undefined,
          });
        } else {
          return onAddCommission({
            client_name: clientName,
            sale_amount: numericSale,
            commission_amount: numericComm,
            sale_date: saleDate,
            installer_option: installerOpt,
            registration_type: regTypeSelect,
            other_installer_name: finalOtherInstaller,
            status: 'pending',
            notes: notes || undefined,
          });
        }

      };
      const saved = await save();
      if (saved) setIsModalOpen(false);
      else setFormError('Não foi possível salvar. Seus dados foram mantidos para tentar novamente.');
      return saved;
    });
  };

  // Filter commissions
  const filteredCommissions = commissions.filter((c) => {
    const matchesSearch =
      c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.other_installer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStartDate = !startDate || c.sale_date >= startDate;
    const matchesEndDate = !endDate || c.sale_date <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate && (operationFilter === 'all' || c.registration_type === operationFilter);
  });

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, startDate, endDate, operationFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (visiblePage - 1) * ITEMS_PER_PAGE;
  const paginatedCommissions = filteredCommissions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate totals
  const totalOwnCommissions = filteredCommissions
    .filter((c) => c.registration_type === 'own')
    .reduce((acc, c) => acc + c.commission_amount, 0);

  const totalPagar = filteredCommissions
    .filter((c) => c.registration_type === 'implanted_for_other')
    .reduce((acc, c) => acc + c.commission_amount, 0);

  const totalReceber = filteredCommissions
    .filter((c) => c.registration_type === 'other_implanted_for_me')
    .reduce((acc, c) => acc + c.commission_amount, 0);

  const comissaoPrevistaBruta = totalOwnCommissions + totalPagar + totalReceber;
  const saldoLiquido = comissaoPrevistaBruta - totalPagar;

  // Breakdown by person
  const receberPorPessoa: Record<string, number> = {};
  const pagarPorPessoa: Record<string, number> = {};

  filteredCommissions.forEach((c) => {
    const person = c.other_installer_name || 'Vendedor';
    if (c.registration_type === 'other_implanted_for_me') {
      receberPorPessoa[person] = (receberPorPessoa[person] || 0) + c.commission_amount;
    }
    if (c.registration_type === 'implanted_for_other') {
      pagarPorPessoa[person] = (pagarPorPessoa[person] || 0) + c.commission_amount;
    }
  });

  // Export Excel with summary rows right below the last record
  const handleExportExcel = () => {
    // 1. Individual sales records
    const salesData = filteredCommissions.map((c) => ({
      Cliente: c.client_name,
      'Valor Venda': c.sale_amount,
      'Comissão (R$)': c.commission_amount,
      Data: c.sale_date,
      'Quem Implantou': c.registration_type === 'implanted_for_other' ? 'Eu' : c.other_installer_name || 'Outro',
      'Vendedor Envolvido': c.other_installer_name || 'N/A',
      'Tipo de Registro': 
        c.registration_type === 'own'
          ? 'Venda Própria'
          : c.registration_type === 'implanted_for_other'
          ? 'Implantei p/ Outro (Repassar)'
          : 'Outro Implantou p/ Mim (Receber)',
      Observações: c.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(salesData);

    // 2. Summary rows appended right below the last record
    const summaryRows: any[] = [
      {}, // Empty row space
      { Cliente: '=== RESUMO DE REPASSES E RECEBIMENTOS POR VENDEDOR ===' },
    ];

    // Values to receive from each seller
    Object.entries(receberPorPessoa).forEach(([name, amount]) => {
      summaryRows.push({
        Cliente: `[A RECEBER DE] ${name}`,
        'Comissão (R$)': amount,
        'Tipo de Registro': 'A Receber de Outro Vendedor',
      });
    });

    // Values to send / repass to each seller
    Object.entries(pagarPorPessoa).forEach(([name, amount]) => {
      summaryRows.push({
        Cliente: `[A REPASSAR / ENVIAR PARA] ${name}`,
        'Comissão (R$)': amount,
        'Tipo de Registro': 'A Repassar para Outro Vendedor',
      });
    });

    // Grand totals
    summaryRows.push({});
    summaryRows.push({
      Cliente: 'TOTAL A RECEBER DE OUTROS',
      'Comissão (R$)': totalReceber,
    });
    summaryRows.push({
      Cliente: 'TOTAL A REPASSAR A OUTROS',
      'Comissão (R$)': totalPagar,
    });
    summaryRows.push({
      Cliente: 'SALDO LÍQUIDO FINAL',
      'Comissão (R$)': saldoLiquido,
    });

    // Append summary rows directly below the last row of the sheet
    XLSX.utils.sheet_add_json(worksheet, summaryRows, {
      skipHeader: true,
      origin: -1,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comissões');
    XLSX.writeFile(workbook, `Relatorio_Comissoes_Show_${getLocalDateString()}.xlsx`);
  };

  const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const dateLabel = (value: string) => value ? value.split('-').reverse().join('/') : '';
  const hasFilters = !!(searchTerm || startDate || endDate || operationFilter !== 'all');
  const clearFilters = () => { setSearchTerm(''); setStartDate(''); setEndDate(''); setOperationFilter('all'); };
  const setMonth = (offset: number) => {
    const now = new Date();
    setStartDate(getLocalDateString(new Date(now.getFullYear(), now.getMonth() + offset, 1)));
    setEndDate(getLocalDateString(new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)));
  };
  const operations = [
    { value: 'own', label: 'Venda Própria', description: 'Cliente meu, implantação minha. Comissão integral.' },
    { value: 'implanted_for_other', label: 'Implantei para outro vendedor', description: 'A repassar: comissão destinada ao vendedor parceiro.' },
    { value: 'other_implanted_for_me', label: 'Outro vendedor implantou para mim', description: 'A receber: comissão que o parceiro deve repassar a você.' },
  ] as const;
  return <div className="commissions-page">
    <header className="commissions-heading"><div><h1>Comissões</h1><p className="ui-muted">Acompanhe suas vendas e os repasses entre vendedores.</p></div><button className="ui-button ui-button-primary" onClick={handleOpenAddModal}><Plus size={18} />Cadastrar Venda</button></header>
    <section className="commission-metrics" aria-label="Resumo dos registros filtrados">
      {[['Comissão prevista bruta',comissaoPrevistaBruta,'Próprias + a receber + a repassar'],['A receber',totalReceber,'De outros vendedores'],['A repassar',totalPagar,'Para outros vendedores'],['Saldo líquido previsto',saldoLiquido,'Bruta menos o valor a repassar']].map(([label,value,description],i) => <article className={`ui-panel commission-metric metric-${i}`} key={label}><span>{label}</span><strong>{money(Number(value))}</strong><p>{description}</p></article>)}
    </section>
    <section className="ui-panel commission-filters" aria-label="Filtros de comissões">
        <div className="commission-search-row"><label className="commission-search"><Search size={18} /><input className="ui-input" aria-label="Pesquisar comissões" placeholder="Pesquisar por Cliente, Vendedor ou Notas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></label><button className="ui-button ui-button-secondary" disabled={!filteredCommissions.length} onClick={handleExportExcel} title="Exportar todos os registros filtrados, incluindo outras páginas"><Download size={17} />Exportar Excel</button></div>
        <div className="commission-filter-row"><label className="quote-field">De<input className="ui-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label><label className="quote-field">Até<input className="ui-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label><label className="quote-field">Operação<select className="ui-input" aria-label="Operação" value={operationFilter} onChange={e => setOperationFilter(e.target.value)}><option value="all">Todas as operações</option><option value="own">Venda própria</option><option value="other_implanted_for_me">A receber</option><option value="implanted_for_other">A repassar</option></select></label><div className="commission-shortcuts"><button className="ui-button ui-button-secondary" onClick={() => setMonth(0)}>Este mês</button><button className="ui-button ui-button-secondary" onClick={() => setMonth(-1)}>Mês anterior</button>{hasFilters && <button className="ui-button ui-button-secondary" onClick={clearFilters}>Limpar filtros</button>}</div></div>
        {startDate && endDate && startDate > endDate && <p className="quote-error" role="alert">A data inicial deve ser anterior ou igual à data final.</p>}
    </section>
    <section className="ui-panel commission-records" aria-label="Registros de comissões">
      {!filteredCommissions.length ? <div className="commission-empty"><Coins size={30} /><h2>{hasFilters ? 'Nenhuma venda encontrada' : 'Suas comissões começam aqui'}</h2><p>{hasFilters ? 'Ajuste os filtros para consultar outros registros.' : 'Cadastre sua primeira venda para acompanhar os valores.'}</p><button className="ui-button ui-button-secondary" onClick={hasFilters ? clearFilters : handleOpenAddModal}>{hasFilters ? 'Ver todos os registros' : 'Cadastrar Venda'}</button></div> : <>
      <div className="commission-table-wrap"><table className="commission-table"><thead><tr><th>Cliente / operação</th><th>Data</th><th className="money">Valor da venda</th><th className="money">Comissão</th><th>Observações</th><th>Ações</th></tr></thead><tbody>{paginatedCommissions.map(c => <tr key={c.id}>
        <td data-label="Cliente"><strong>{c.client_name}</strong><div className={`commission-operation operation-${c.registration_type}`}>{c.registration_type === 'own' ? 'Venda própria' : c.registration_type === 'implanted_for_other' ? 'A repassar' : 'A receber'}{c.other_installer_name && c.registration_type !== 'own' ? ` · ${c.other_installer_name}` : ''}</div></td>
        <td data-label="Data">{dateLabel(c.sale_date)}</td><td data-label="Venda" className="money">{money(c.sale_amount)}</td><td data-label="Comissão" className="money commission-value">{money(c.commission_amount)}</td>
        <td data-label="Observações"><button className="commission-note" onClick={() => c.notes ? setViewingNotesComm(c) : handleOpenEditModal(c)} aria-label={`Observações de ${c.client_name}`}><FileText size={15} /><span>{c.notes || 'Adicionar nota'}</span></button></td>
        <td data-label="Ações"><div className="commission-actions"><button className="ui-icon-button" title="Editar Venda ou Observações" aria-label={`Editar venda de ${c.client_name}`} onClick={() => handleOpenEditModal(c)}><Edit2 size={16} /></button><button className="ui-icon-button" title="Excluir Registro" aria-label={`Excluir venda de ${c.client_name}`} onClick={() => { setFormError(''); setDeletingId(c.id); }}><Trash2 size={16} /></button></div></td>
      </tr>)}</tbody></table></div>
      <footer className="commission-pagination"><span>Mostrando {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE,filteredCommissions.length)} de {filteredCommissions.length}</span><div><button className="ui-button ui-button-secondary" disabled={visiblePage === 1} onClick={() => setCurrentPage(visiblePage - 1)}>Anterior</button><span>{visiblePage} / {totalPages}</span><button className="ui-button ui-button-secondary" disabled={visiblePage === totalPages} onClick={() => setCurrentPage(visiblePage + 1)}>Próxima</button></div></footer></>}
    </section>
    <details className="ui-panel commission-breakdown"><summary>Repasses por vendedor <span className="ui-muted">A receber {money(totalReceber)} · A repassar {money(totalPagar)}</span></summary><div className="commission-breakdown-grid">{([['A receber',receberPorPessoa],['A repassar',pagarPorPessoa]] as [string, Record<string, number>][]).map(([title,entries]) => <section key={String(title)}><h2>{String(title)}</h2>{Object.entries(entries).length ? Object.entries(entries).map(([name,value]) => <p key={name}><span>{name}</span><strong>{money(value)}</strong></p>) : <p className="ui-muted">Nenhum valor nos registros filtrados.</p>}</section>)}</div></details>
    <p className="commission-footnote">Valores previstos a partir dos lançamentos; não representam confirmação de pagamento.</p>
    {isModalOpen && <QuoteDialog label={editingComm ? 'Editar venda' : 'Cadastrar venda'} className="commission-editor" canClose={!isPending} onClose={() => setIsModalOpen(false)}>
      <header className="commission-editor-header"><div><h2>{editingComm ? 'Editar venda' : 'Cadastrar venda'}</h2><p className="ui-muted">Informe a operação e os dados da venda.</p></div><button className="ui-icon-button" disabled={isPending} aria-label="Fechar cadastro de venda" onClick={() => setIsModalOpen(false)}><X size={20} /></button></header>
      <form onSubmit={handleFormSubmit} className="commission-form"><fieldset disabled={isPending} className="commission-form-body">
        <fieldset className="commission-operation-options"><legend>Tipo de operação</legend>{operations.map(option => <label key={option.value} className={regTypeSelect === option.value ? 'selected' : ''}><input type="radio" name="regType" checked={regTypeSelect === option.value} onChange={() => setRegTypeSelect(option.value)} /><span><strong>{option.label}</strong><small>{option.description}</small></span></label>)}</fieldset>
        {regTypeSelect !== 'own' && <div className="commission-partner"><label className="quote-field">Vendedor parceiro{!isAddingNewSellerInline ? <select className="ui-input" aria-label="Vendedor parceiro" value={selectedSeller} required onChange={e => { setSelectedSeller(e.target.value); if(e.target.value === 'NEW') setIsAddingNewSellerInline(true); }}><option value="" disabled>Selecione um vendedor</option>{allSellers.map(seller => <option key={seller}>{seller}</option>)}<option value="NEW">+ Cadastrar Novo Vendedor...</option></select> : <input className="ui-input" aria-label="Nome do novo vendedor" placeholder="Digite o nome do novo vendedor..." value={newSellerInput} required onChange={e => setNewSellerInput(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); handleConfirmNewSeller(); } }} />}</label><div className="commission-inline-actions">{!isAddingNewSellerInline ? <button type="button" className="ui-button ui-button-secondary" onClick={() => setIsAddingNewSellerInline(true)}><UserPlus size={16} />Novo vendedor</button> : <><button type="button" className="ui-button ui-button-secondary" disabled={!newSellerInput.trim()} onClick={handleConfirmNewSeller}>Cadastrar</button><button type="button" className="ui-button ui-button-secondary" onClick={() => { setIsAddingNewSellerInline(false); setSelectedSeller(allSellers[0] || ''); setNewSellerInput(''); }}>Cancelar novo vendedor</button></>}</div></div>}
        <label className="quote-field">Nome do cliente *<input className="ui-input" required placeholder="ex: Frota Rodoviária Alfa" value={clientName} onChange={e => setClientName(e.target.value)} /></label>
        <div className="commission-form-grid"><label className="quote-field">Valor da venda (R$) *<input className="ui-input" type="number" step="0.01" required placeholder="15000.00" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} /></label><label className="quote-field">Comissão (R$) *<input className="ui-input" type="number" step="0.01" required placeholder="1500.00" value={commissionAmount} onChange={e => setCommissionAmount(e.target.value)} /></label></div>
        <label className="quote-field">Data da venda<input className="ui-input" type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></label>
        <label className="quote-field">Observações / histórico de repasse<textarea className="ui-input" rows={3} placeholder="Informações sobre a venda ou o repasse" value={notes} onChange={e => setNotes(e.target.value)} /></label>
      </fieldset><footer className="commission-form-footer">{formError && <p className="quote-error" role="alert">{formError}</p>}<div><button type="button" className="ui-button ui-button-secondary" disabled={isPending} onClick={() => setIsModalOpen(false)}>Cancelar</button><button className="ui-button ui-button-primary" type="submit" disabled={isPending}>{isPending ? 'Salvando...' : editingComm ? 'Salvar Alterações' : 'Salvar Venda'}</button></div></footer></form>
    </QuoteDialog>}
    {viewingNotesComm && <QuoteDialog label="Observações da venda" onClose={() => setViewingNotesComm(null)}><div className="quote-preview"><header className="quote-modal-heading"><div><h2>Observações</h2><p className="ui-muted">{viewingNotesComm.client_name}</p></div><button className="ui-icon-button" aria-label="Fechar observações" onClick={() => setViewingNotesComm(null)}><X size={20} /></button></header><p className="commission-notes-text">{viewingNotesComm.notes || 'Nenhuma observação informada.'}</p><footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" onClick={() => setViewingNotesComm(null)}>Fechar</button><button className="ui-button ui-button-primary" onClick={() => { handleOpenEditModal(viewingNotesComm); setViewingNotesComm(null); }}>Editar Venda / Nota</button></footer></div></QuoteDialog>}
    {deletingId && <QuoteDialog label="Excluir Registro de Comissão" canClose={!isPending} onClose={() => setDeletingId(null)}><div className="quote-preview"><h2>Excluir registro de comissão?</h2><p className="ui-muted my-4">A venda de {commissions.find(c => c.id === deletingId)?.client_name} será removida do histórico e dos totais.</p>{formError && <p className="quote-error" role="alert">{formError}</p>}<footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" disabled={isPending} onClick={() => setDeletingId(null)}>Cancelar</button><button className="ui-button commission-danger" disabled={isPending} onClick={async () => { if(await run(() => onDeleteCommission(deletingId))) setDeletingId(null); else setFormError('Não foi possível excluir. Tente novamente.'); }}>{isPending ? 'Aguarde...' : 'Confirmar'}</button></footer></div></QuoteDialog>}
  </div>;
};
