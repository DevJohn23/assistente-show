'use client';

import React, { useState } from 'react';
import { Commission, CommissionRegistrationType } from '@/types';
import { 
  Search, 
  Plus, 
  Download, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Trash2, 
  Edit2,
  X,
  UserPlus,
  FileText,
  Eye,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ConfirmModal } from './ConfirmModal';

interface CommissionsViewProps {
  commissions: Commission[];
  sellers: string[];
  onAddSeller: (name: string) => void;
  onAddCommission: (comm: Omit<Commission, 'id' | 'user_id'>) => void;
  onEditCommission: (id: string, updated: Partial<Commission>) => void;
  onDeleteCommission: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const CommissionsView: React.FC<CommissionsViewProps> = ({
  commissions,
  sellers,
  onAddSeller,
  onAddCommission,
  onEditCommission,
  onDeleteCommission,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit State
  const [editingComm, setEditingComm] = useState<Commission | null>(null);
  const [viewingNotesComm, setViewingNotesComm] = useState<Commission | null>(null);

  // Form State
  const [clientName, setClientName] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  
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
    setEditingComm(null);
    setClientName('');
    setSaleAmount('');
    setCommissionAmount('');
    setSaleDate(new Date().toISOString().split('T')[0]);
    setRegTypeSelect('own');
    setSelectedSeller(allSellers[0] || '');
    setNewSellerInput('');
    setIsAddingNewSellerInline(false);
    setNotes('');
    setIsModalOpen(true);
  };

  // Open modal for Editing existing sale
  const handleOpenEditModal = (comm: Commission) => {
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
  const handleConfirmNewSeller = () => {
    const trimmed = newSellerInput.trim();
    if (trimmed) {
      onAddSeller(trimmed);
      setSelectedSeller(trimmed);
      setIsAddingNewSellerInline(false);
      setNewSellerInput('');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !saleAmount || !commissionAmount) return;

    let finalSellerName = '';
    if (regTypeSelect !== 'own') {
      if (isAddingNewSellerInline || selectedSeller === 'NEW') {
        finalSellerName = newSellerInput.trim();
        if (finalSellerName) {
          onAddSeller(finalSellerName);
        }
      } else {
        finalSellerName = selectedSeller;
      }
    }

    const payload = {
      client_name: clientName,
      sale_amount: parseFloat(saleAmount),
      commission_amount: parseFloat(commissionAmount),
      sale_date: saleDate,
      installer_option: regTypeSelect === 'implanted_for_other' ? ('me' as const) : ('other' as const),
      other_installer_name: regTypeSelect !== 'own' ? (finalSellerName || undefined) : undefined,
      registration_type: regTypeSelect,
      status: editingComm ? editingComm.status : ('pending' as const),
      notes,
    };

    if (editingComm) {
      onEditCommission(editingComm.id, payload);
    } else {
      onAddCommission(payload);
    }

    setIsModalOpen(false);
  };

  // Filter commissions
  const filteredCommissions = commissions.filter((c) => {
    const matchesSearch =
      c.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.other_installer_name && c.other_installer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (startDate && c.sale_date < startDate) return false;
    if (endDate && c.sale_date > endDate) return false;

    return true;
  });

  // Financial Balances
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

  // Export Excel
  const handleExportExcel = () => {
    const dataToExport = filteredCommissions.map((c) => ({
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

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comissões');
    XLSX.writeFile(workbook, `Relatorio_Comissoes_Show_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Comissão Prevista (Bruto) */}
        <div className="clean-card p-5 rounded-2xl">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Comissão Prevista (Bruto)</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-outfit">
            R$ {comissaoPrevistaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Próprias + Implantações + A Receber</p>
        </div>

        {/* A Receber */}
        <div className="clean-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">A Receber</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-outfit">
            R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Outros implantaram p/ você</p>
        </div>

        {/* A Repassar */}
        <div className="clean-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">A Repassar</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-outfit">
            R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Você implantou p/ outros</p>
        </div>

        {/* Saldo Líquido */}
        <div className="clean-card p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border-sky-200 dark:border-sky-500/30">
          <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide">Saldo Líquido Final</span>
          <p className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-2 font-outfit">
            R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-sky-700/80 dark:text-slate-400 mt-1">Líquido retido (Bruto - Repassar)</p>
        </div>
      </div>

      {/* Action Bar & Date Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por Cliente, Vendedor ou Notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-sm"
          />
        </div>

        {/* Date Filter & Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 shadow-sm"
          />
          <span className="text-xs text-slate-500 dark:text-slate-400">até</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 shadow-sm"
          />

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Venda</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="clean-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
            <thead className="bg-slate-100 dark:bg-slate-900 text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Cliente</th>
                <th className="px-5 py-3.5">Valor Venda</th>
                <th className="px-5 py-3.5">Comissão</th>
                <th className="px-5 py-3.5">Operação / Vendedor</th>
                <th className="px-5 py-3.5">Data</th>
                <th className="px-5 py-3.5">Observações</th>
                <th className="px-5 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    Nenhum registro de comissão cadastrado neste período.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{c.client_name}</td>
                    
                    <td className="px-5 py-3.5 font-mono text-slate-900 dark:text-slate-200 font-semibold">
                      R$ {c.sale_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      R$ {c.commission_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-5 py-3.5">
                      {c.registration_type === 'own' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-500/20">
                          <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          Venda Própria
                        </span>
                      )}

                      {c.registration_type === 'implanted_for_other' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20">
                          <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Implantei p/ {c.other_installer_name || 'Outro'} (Repassar)
                        </span>
                      )}

                      {c.registration_type === 'other_implanted_for_me' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {c.other_installer_name || 'Outro'} Implantou p/ Mim (Receber)
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-700 dark:text-slate-400 font-medium">{c.sale_date}</td>

                    <td className="px-5 py-3.5 max-w-xs">
                      {c.notes ? (
                        <div 
                          onClick={() => setViewingNotesComm(c)}
                          title="Clique para visualizar ou editar observação completa"
                          className="cursor-pointer group flex items-center justify-between gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 truncate font-medium">
                            {c.notes}
                          </span>
                          <Eye className="w-3 h-3 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      ) : (
                        <span 
                          onClick={() => handleOpenEditModal(c)}
                          className="text-[11px] text-slate-400 dark:text-slate-500 cursor-pointer hover:underline"
                        >
                          + Adicionar nota
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Editar Venda / Observação */}
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          title="Editar Venda ou Observações"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Excluir Venda */}
                        <button
                          onClick={() => setDeletingId(c.id)}
                          title="Excluir Registro"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown Report Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="clean-card p-4 rounded-2xl">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2.5 flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Detalhamento: A Receber de Outros Vendedores
          </h4>
          {Object.keys(receberPorPessoa).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum repasse a receber pendente.</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(receberPorPessoa).map(([name, amount]) => (
                <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{name}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    + R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="clean-card p-4 rounded-2xl">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-2.5 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Detalhamento: A Repassar (Pagar) a Outros Vendedores
          </h4>
          {Object.keys(pagarPorPessoa).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum repasse a pagar pendente.</p>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(pagarPorPessoa).map(([name, amount]) => (
                <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{name}</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                    - R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Cadastrar / Editar Venda: Fixed Header + Scrollable Body + Fixed Footer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                {editingComm ? 'Editar Venda & Observações' : 'Cadastrar Nova Venda'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form wrapping scrollable body and fixed footer */}
            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Frota Rodoviária Alfa"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Valor da Venda (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="15000.00"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Comissão (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="1500.00"
                      value={commissionAmount}
                      onChange={(e) => setCommissionAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Data da Venda</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* 3-Way Operation Type Selector */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <label className="block text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                    Tipo de Operação & Regra Financeira *
                  </label>
                  
                  <div className="space-y-2">
                    {/* Option 1: Venda Própria */}
                    <label 
                      onClick={() => setRegTypeSelect('own')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        regTypeSelect === 'own'
                          ? 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-slate-900 dark:text-white font-medium shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="regType"
                        checked={regTypeSelect === 'own'}
                        onChange={() => setRegTypeSelect('own')}
                        className="mt-0.5 text-sky-600 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold block text-slate-900 dark:text-white">Venda Própria</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Cliente meu, implantação minha. 100% retido.</span>
                      </div>
                    </label>

                    {/* Option 2: Implantei para Outro Vendedor */}
                    <label 
                      onClick={() => setRegTypeSelect('implanted_for_other')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        regTypeSelect === 'implanted_for_other'
                          ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-slate-900 dark:text-white font-medium shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="regType"
                        checked={regTypeSelect === 'implanted_for_other'}
                        onChange={() => setRegTypeSelect('implanted_for_other')}
                        className="mt-0.5 text-rose-600 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold block text-rose-700 dark:text-rose-300">Implantei para Outro Vendedor (A Repassar)</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Comissão entra na minha conta -> Devo repassar ao vendedor.</span>
                      </div>
                    </label>

                    {/* Option 3: Outro Vendedor Implantou para Mim */}
                    <label 
                      onClick={() => setRegTypeSelect('other_implanted_for_me')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        regTypeSelect === 'other_implanted_for_me'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white font-medium shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="regType"
                        checked={regTypeSelect === 'other_implanted_for_me'}
                        onChange={() => setRegTypeSelect('other_implanted_for_me')}
                        className="mt-0.5 text-emerald-600 focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold block text-emerald-800 dark:text-emerald-300">Outro Vendedor Implantou p/ Mim (A Receber)</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Comissão caiu na conta dele -> Tenho a receber do vendedor.</span>
                      </div>
                    </label>
                  </div>

                  {/* Pre-registered Salesperson Selection */}
                  {regTypeSelect !== 'own' && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Selecione o Vendedor Parceiro Envolvido *
                      </label>
                      
                      {!isAddingNewSellerInline ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedSeller}
                            onChange={(e) => {
                              if (e.target.value === 'NEW') {
                                setIsAddingNewSellerInline(true);
                                setSelectedSeller('NEW');
                              } else {
                                setSelectedSeller(e.target.value);
                              }
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-sky-500"
                          >
                            {allSellers.map((seller) => (
                              <option key={seller} value={seller}>
                                {seller}
                              </option>
                            ))}
                            <option value="NEW">+ Cadastrar Novo Vendedor...</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewSellerInline(true);
                              setSelectedSeller('NEW');
                            }}
                            title="Cadastrar novo vendedor"
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-600 text-sky-700 dark:text-sky-400 hover:text-white border border-sky-200 dark:border-sky-500/20 text-xs font-semibold flex items-center gap-1 shrink-0 transition-all"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>+ Novo</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            placeholder="Digite o nome do novo vendedor..."
                            value={newSellerInput}
                            onChange={(e) => setNewSellerInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleConfirmNewSeller();
                              }
                            }}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-sky-500 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={handleConfirmNewSeller}
                            disabled={!newSellerInput.trim()}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1 shrink-0 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Cadastrar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewSellerInline(false);
                              setNewSellerInput('');
                              if (allSellers.length > 0) setSelectedSeller(allSellers[0]);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shrink-0"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Observações / Histórico de Repasse
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Receber junto com lote. Repasse antecipado de R$ 300 efetuado em 02/08..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 bg-slate-50 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {editingComm ? 'Salvar Alterações' : 'Salvar Venda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Leitura / Edição Rápida da Observação */}
      {viewingNotesComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl relative">
            <button
              onClick={() => setViewingNotesComm(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-sky-600 dark:text-sky-400">
              <FileText className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                Observações de {viewingNotesComm.client_name}
              </h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
              {viewingNotesComm.notes || 'Nenhuma observação informada.'}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setViewingNotesComm(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  const comm = viewingNotesComm;
                  setViewingNotesComm(null);
                  handleOpenEditModal(comm);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Venda / Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Excluir Registro de Comissão"
        message="Tem certeza que deseja remover esta venda do seu histórico de comissões?"
        onConfirm={() => {
          if (deletingId) onDeleteCommission(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
