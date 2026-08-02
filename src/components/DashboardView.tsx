'use client';

import React from 'react';
import { Opportunity, Commission } from '@/types';
import { 
  AlertTriangle, 
  Hourglass, 
  TrendingUp, 
  Coins, 
  ArrowUpRight, 
  Plus, 
  ShoppingBag,
  CalendarCheck
} from 'lucide-react';

interface DashboardViewProps {
  opportunities: Opportunity[];
  commissions: Commission[];
  setActiveTab: (tab: string) => void;
  onNewOpportunity: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  opportunities,
  commissions,
  setActiveTab,
  onNewOpportunity,
}) => {
  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const dueToday = opportunities.filter((o) => o.expiration_date === todayStr);
  const dueTomorrow = opportunities.filter((o) => o.expiration_date === tomorrowStr);
  
  const currentMonthSales = commissions.length;
  
  // Total Bruto previsto das operações do mês (Próprias + Implantações + A Receber)
  const totalCommissionExpected = commissions.reduce((acc, c) => acc + c.commission_amount, 0);

  const chartDays = [
    { day: 'Seg', count: 2 },
    { day: 'Ter', count: 4 },
    { day: 'Qua', count: 1 },
    { day: 'Qui', count: 5 },
    { day: 'Sex', count: 3 },
    { day: 'Sáb', count: 0 },
    { day: 'Dom', count: 1 },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-outfit">
              Bom dia, Marcos 👋
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
              Confira seus lembretes de renovação de clientes e acompanhe o fechamento das suas comissões deste mês.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewOpportunity}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Nova Oportunidade</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Gerar Orçamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Vencem Hoje */}
        <div 
          onClick={() => setActiveTab('opportunities')}
          className="clean-card clean-card-hover p-5 rounded-2xl cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Vencem Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3 font-outfit">
            {dueToday.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center justify-between">
            <span>Oportunidades para ação</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </p>
        </div>

        {/* Card 2: Vencem Amanhã */}
        <div 
          onClick={() => setActiveTab('opportunities')}
          className="clean-card clean-card-hover p-5 rounded-2xl cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Vencem Amanhã</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3 font-outfit">
            {dueTomorrow.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center justify-between">
            <span>Próximos vencimentos</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </p>
        </div>

        {/* Card 3: Vendas Registradas */}
        <div 
          onClick={() => setActiveTab('commissions')}
          className="clean-card clean-card-hover p-5 rounded-2xl cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Vendas do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3 font-outfit">
            {currentMonthSales}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center justify-between">
            <span>Volume registrado</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </p>
        </div>

        {/* Card 4: Comissão Prevista */}
        <div 
          onClick={() => setActiveTab('commissions')}
          className="clean-card clean-card-hover p-5 rounded-2xl cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Comissão Prevista</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3 font-outfit">
            R$ {totalCommissionExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center justify-between">
            <span>Movimentação bruta prevista</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Quick Opportunities List */}
        <div className="lg:col-span-2 clean-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Lembretes de Hoje
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clientes que precisam de contato para renovação</p>
            </div>
            <button 
              onClick={() => setActiveTab('opportunities')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
            >
              Ver todas ({opportunities.length}) &rarr;
            </button>
          </div>

          {dueToday.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-400">Nenhuma oportunidade vence hoje 🎉</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Sua carteira está atualizada!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dueToday.map((opp) => (
                <div 
                  key={opp.id} 
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-xs">{opp.client_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{opp.notes || 'Sem observações'}</p>
                  </div>

                  <a
                    href={`https://wa.me/55${opp.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Simple Chart */}
        <div className="clean-card p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-outfit">Oportunidades por dia</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Distribuição semanal da sua carteira</p>
          </div>

          <div className="mt-6 flex items-end justify-between gap-2 h-40 px-2">
            {chartDays.map((item, idx) => {
              const maxHeight = 110;
              const height = item.count > 0 ? (item.count / 5) * maxHeight : 6;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{item.count > 0 ? item.count : ''}</span>
                  <div
                    style={{ height: `${height}px` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      item.count > 3
                        ? 'bg-sky-600'
                        : item.count > 0
                        ? 'bg-sky-500/60 dark:bg-sky-600/50'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  ></div>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4">
            Resumo semanal de vencimentos
          </p>
        </div>
      </div>
    </div>
  );
};
