'use client';

import React, { useState } from 'react';
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
  MessageSquare,
  X,
  Building2,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ConfirmModal } from './ConfirmModal';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onAddOpportunity: (opp: Omit<Opportunity, 'id' | 'user_id'>) => void;
  onEditOpportunity: (id: string, updated: Partial<Opportunity>) => void;
  onDeleteOpportunity: (id: string) => void;
  onRenewOpportunity: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onAddOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onRenewOpportunity,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  
  // Edit & Delete state
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renewingOpp, setRenewingOpp] = useState<Opportunity | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    cpf_cnpj: '',
    type: 'PF' as ClientType,
    phone: '',
    company_name: '',
    registration_date: new Date().toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const handleOpenAddModal = () => {
    setEditingOpp(null);
    setFormData({
      client_name: '',
      cpf_cnpj: '',
      type: 'PF',
      phone: '',
      company_name: '',
      registration_date: new Date().toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (opp: Opportunity) => {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.phone) return;

    if (editingOpp) {
      onEditOpportunity(editingOpp.id, formData);
    } else {
      onAddOpportunity({
        ...formData,
        status: 'active',
      });
    }
    setIsModalOpen(false);
  };

  // Date filters logic
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0];
  const twoDaysStr = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

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
    if (activeFilter === 'today') return opp.expiration_date === todayStr;
    if (activeFilter === 'tomorrow') return opp.expiration_date === tomorrowStr;
    if (activeFilter === 'twoDays') return opp.expiration_date === twoDaysStr;
    if (activeFilter === 'thisWeek') {
      const exp = new Date(opp.expiration_date).getTime();
      const now = new Date().getTime();
      const diffDays = (exp - now) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (activeFilter === 'expired') return opp.expiration_date < todayStr;

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

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por Nome, Empresa, CPF/CNPJ ou Telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors shadow-sm"
          />
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'calendar' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Exportar (.xlsx)</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'PF', label: 'PF (Pessoa Física)' },
          { id: 'PJ', label: 'PJ (Pessoa Jurídica)' },
          { id: 'today', label: 'Vencem hoje' },
          { id: 'tomorrow', label: 'Vencem amanhã' },
          { id: 'twoDays', label: 'Vencem em 2 dias' },
          { id: 'thisWeek', label: 'Esta semana' },
          { id: 'expired', label: 'Vencidas' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all ${
              activeFilter === filter.id
                ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Main Content: Table or Calendar */}
      {viewMode === 'table' ? (
        <div className="clean-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-900 text-[11px] uppercase font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Cliente / Empresa</th>
                  <th className="px-5 py-3.5">Contato / CPF-CNPJ</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Vencimento</th>
                  <th className="px-5 py-3.5">Observações</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                {filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                      Nenhuma oportunidade encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map((opp) => {
                    const isDueToday = opp.expiration_date === todayStr;
                    const isExpired = opp.expiration_date < todayStr;

                    return (
                      <tr key={opp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{opp.client_name}</div>
                          {opp.company_name && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {opp.company_name}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-mono text-slate-900 dark:text-slate-200 font-semibold">{opp.phone}</div>
                          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opp.cpf_cnpj}</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                              opp.type === 'PJ'
                                ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/20'
                                : 'bg-teal-100 dark:bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-500/20'
                            }`}
                          >
                            {opp.type === 'PJ' ? <Building2 className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {opp.type}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div
                            className={`font-bold ${
                              isDueToday
                                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                                : isExpired
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-900 dark:text-slate-200'
                            }`}
                          >
                            {opp.expiration_date}
                          </div>
                          {isDueToday && <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Vence Hoje</span>}
                          {isExpired && <span className="text-[10px] text-rose-700 dark:text-rose-400 font-bold">Vencida</span>}
                        </td>

                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{opp.notes || '-'}</p>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* WhatsApp Direct Link */}
                            <a
                              href={`https://wa.me/55${opp.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir no WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-400 hover:text-white border border-emerald-300 dark:border-emerald-500/20 transition-all"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>

                            {/* Renovar */}
                            <button
                              onClick={() => setRenewingOpp(opp)}
                              title="Renovar Oportunidade (+30 dias)"
                              className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-600 text-sky-700 dark:text-sky-400 hover:text-white border border-sky-300 dark:border-sky-500/20 transition-all"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => handleOpenEditModal(opp)}
                              title="Editar Oportunidade"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Excluir */}
                            <button
                              onClick={() => setDeletingId(opp.id)}
                              title="Excluir Oportunidade"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200 dark:border-rose-500/20 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="clean-card p-5 rounded-2xl">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4 font-outfit">Visualização por Calendário</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredOpportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => handleOpenEditModal(opp)}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer transition-all shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{opp.expiration_date}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-sky-300 font-bold border border-slate-300 dark:border-slate-700">
                    {opp.type}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{opp.client_name}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{opp.notes || 'Sem detalhes'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Modal (Add / Edit): Fixed Header + Scrollable Body + Fixed Footer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
                {editingOpp ? 'Editar Oportunidade' : 'Nova Oportunidade'}
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
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Transportadora Alfa"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Tipo de Pessoa *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as ClientType })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="PF">Pessoa Física (PF)</option>
                      <option value="PJ">Pessoa Jurídica (PJ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      CPF ou CNPJ *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="00.000.000/0000-00"
                      value={formData.cpf_cnpj}
                      onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="11999998888"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Nome da empresa"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
                      <span>Data de Cadastro</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registration_date}
                      onChange={(e) => setFormData({ ...formData, registration_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Data de Vencimento *</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiration_date}
                      onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Observações
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Cliente pediu retorno semana que vem..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renewal Confirmation Modal */}
      {renewingOpp && (
        <ConfirmModal
          isOpen={!!renewingOpp}
          title="Renovar Oportunidade"
          message={`Deseja renovar a oportunidade de "${renewingOpp.client_name}" por mais 30 dias?`}
          onConfirm={() => {
            onRenewOpportunity(renewingOpp.id);
            setRenewingOpp(null);
          }}
          onCancel={() => setRenewingOpp(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Excluir Oportunidade"
        message="Tem certeza que deseja remover esta oportunidade da sua carteira?"
        onConfirm={() => {
          if (deletingId) onDeleteOpportunity(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
};
