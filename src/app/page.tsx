'use client';
import { orderCatalogProducts } from '@/lib/catalogOrder';
import { getLocalDateString } from "@/lib/dateUtils";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { OpportunitiesView } from '@/components/OpportunitiesView';
import { CommissionsView } from '@/components/CommissionsView';
import { CatalogQuoteView } from '@/components/CatalogQuoteView';
import { TecnicosBuscadorView } from '@/components/TecnicosBuscadorView';
import { LoginView } from '@/components/LoginView';

import { useAuth } from '@/context/AuthContext';
import { Opportunity, Commission, QuoteTemplate, Product } from '@/types';
import {
  fetchOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  fetchCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
  fetchSellers,
  createSeller,
  fetchQuoteTemplates,
  createQuoteTemplate,
  updateQuoteTemplate,
  deleteQuoteTemplate,
} from '@/lib/supabaseServices';
import { supabase } from '@/lib/supabase';


export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_active_tab');
      if (saved && ['dashboard', 'opportunities', 'commissions', 'catalog', 'tecnicos'].includes(saved)) {
        return saved;
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && ['dashboard', 'opportunities', 'commissions', 'catalog', 'tecnicos'].includes(tab)) {
      setActiveTab(tab);
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_active_tab', activeTab);
    }
  }, [activeTab]);

  const [opportunitiesFilter, setOpportunitiesFilter] = useState<'all' | 'today' | 'expired'>('all');
  const [commissionPeriod, setCommissionPeriod] = useState<{ start: string; end: string } | undefined>();
  const navigate = (tab: string) => {
    setOpportunitiesFilter('all');
    setCommissionPeriod(undefined);
    setActiveTab(tab);
  };

  // Application State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [sellers, setSellers] = useState<string[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataOwner, setDataOwner] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  // Modal open triggers
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastIsError(isError);
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ignore stale requests after a logout/account switch and never use demo records.
  const userId = user?.id;
  useEffect(() => {
    let cancelled = false;
    setDataOwner(null);
    setOpportunities([]);
    setCommissions([]);
    setSellers([]);
    setTemplates([]);
    setProducts([]);
    setLoadError(false);
    if (!userId) return;

    async function loadUserSupabaseData() {
      setIsDataLoading(true);
      try {
        const [oppsData, commsData, sellersData, tplsData, productsData] = await Promise.all([
          fetchOpportunities(userId!),
          fetchCommissions(userId!),
          fetchSellers(userId!),
          fetchQuoteTemplates(userId!),
          supabase.from('products').select('*')
        ]);
        if (productsData.error) throw productsData.error;
        if (cancelled) return;
        setOpportunities(oppsData);
        setCommissions(commsData);
        setSellers(sellersData);
        setTemplates(tplsData);
        setProducts(orderCatalogProducts(productsData.data ?? []));
        setDataOwner(userId!);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsDataLoading(false);
      }
    }

    void loadUserSupabaseData();
    return () => { cancelled = true; };
  }, [userId, reloadVersion]);

  // If Auth is loading, show clean loading screen
  if (authLoading || (user && !loadError && (isDataLoading || dataOwner !== user.id))) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <p className="brand-signature" style={{ color: 'var(--ui-text)' }}>omnilink<span className="brand-dot">.</span></p>
        <div className="loading-bar" aria-hidden="true" />
        <p className="text-sm">Carregando seus dados…</p>
      </div>
    );
  }

  // If user is not logged in, render Login screen
  if (!user) {
    return <LoginView />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-white p-6">
        <p role="alert">Não foi possível carregar seus dados. Verifique a conexão e tente novamente.</p>
        <button onClick={() => setReloadVersion((value) => value + 1)} className="rounded-xl bg-sky-600 px-4 py-2 text-white">Tentar novamente</button>
      </div>
    );
  }

  const failed = (action: string) => {
    showToast(`Não foi possível ${action}. Verifique a conexão e tente novamente.`, true);
    return false;
  };

  const handleAddOpportunity = async (opp: Omit<Opportunity, 'id' | 'user_id'>) => {
    const saved = await createOpportunity({ ...opp, user_id: user.id });
    if (!saved) return failed('salvar a oportunidade');
    setOpportunities((prev) => [saved, ...prev]);
    showToast('Oportunidade salva.');
    return true;
  };

  const handleEditOpportunity = async (id: string, updated: Partial<Opportunity>) => {
    if (!await updateOpportunity(id, updated)) return failed('atualizar a oportunidade');
    setOpportunities((prev) => prev.map((o) => o.id === id ? { ...o, ...updated } : o));
    showToast('Oportunidade atualizada.');
    return true;
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!await deleteOpportunity(id)) return failed('excluir a oportunidade');
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    showToast('Oportunidade excluída.');
    return true;
  };

  const handleRenewOpportunity = async (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return failed('encontrar a oportunidade');
    const daysToAdd = opp.type === 'PF' ? 15 : 30;
    const currentExp = new Date(opp.expiration_date + 'T00:00:00');
    currentExp.setDate(currentExp.getDate() + daysToAdd);
    const updated = { expiration_date: getLocalDateString(currentExp), status: 'renewed' as const };
    if (!await updateOpportunity(id, updated)) return failed('renovar a oportunidade');
    setOpportunities((prev) => prev.map((o) => o.id === id ? { ...o, ...updated } : o));
    showToast(`Oportunidade renovada (+${daysToAdd} dias para ${opp.type})!`);
    return true;
  };

  const handleAddCommission = async (comm: Omit<Commission, 'id' | 'user_id'>) => {
    const saved = await createCommission({ ...comm, user_id: user.id });
    if (!saved) return failed('salvar a venda');
    setCommissions((prev) => [saved, ...prev]);
    showToast('Venda salva.');
    return true;
  };

  const handleEditCommission = async (id: string, updated: Partial<Commission>) => {
    if (!await updateCommission(id, updated)) return failed('atualizar a venda');
    setCommissions((prev) => prev.map((c) => c.id === id ? { ...c, ...updated } : c));
    showToast('Venda / Observação atualizada.');
    return true;
  };

  const handleDeleteCommission = async (id: string) => {
    if (!await deleteCommission(id)) return failed('excluir a venda');
    setCommissions((prev) => prev.filter((c) => c.id !== id));
    showToast('Registro excluído.');
    return true;
  };

  const handleAddSeller = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return failed('salvar o vendedor');
    if (sellers.includes(trimmed)) return true;
    if (!await createSeller(user.id, trimmed)) return failed('salvar o vendedor');
    setSellers((prev) => [...prev, trimmed]);
    showToast(`Vendedor "${trimmed}" cadastrado.`);
    return true;
  };

  const handleSaveTemplate = async (name: string, items: { product_id: string; quantity: number }[]) => {
    const saved = await createQuoteTemplate({ user_id: user.id, name, items });
    if (!saved) return failed('salvar o modelo de orçamento');
    setTemplates((prev) => [...prev, saved]);
    showToast('Modelo de orçamento salvo!');
    return true;
  };

  const handleUpdateTemplate = async (id: string, updated: Partial<QuoteTemplate>) => {
    if (!await updateQuoteTemplate(id, updated)) return failed('atualizar o modelo de orçamento');
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, ...updated } : t));
    showToast('Modelo de orçamento atualizado.');
    return true;
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!await deleteQuoteTemplate(id)) return failed('excluir o modelo de orçamento');
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Modelo de orçamento excluído.');
    return true;
  };

  // Header Titles Map
  const headerContent: Record<string, { title: string; description: string }> = {
    dashboard: {
      title: 'Dashboard de Produtividade',
      description: 'Resumo das suas principais atividades comerciais do dia',
    },
    opportunities: {
      title: 'Controle de Oportunidades',
      description: 'Gerencie sua carteira de clientes e acompanhe prazos de renovação',
    },
    commissions: {
      title: 'Controle de Comissões',
      description: 'Acompanhe todas as suas vendas, repasses e fechamento do mês',
    },
    catalog: {
      title: 'Catálogo & Gerador de Orçamentos',
      description: '',
    },
    tecnicos: {
      title: 'Rede de Técnicos',
      description: 'Encontre o técnico mais próximo do cliente na rede Omnilink',
    },
  };

  const currentHeader = headerContent[activeTab] || headerContent.dashboard;

  const todayStr = getLocalDateString();
  const opportunitiesDueToday = opportunities.filter((o) => o.expiration_date === todayStr && o.status !== 'won' && o.status !== 'lost').length;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigate}
        opportunitiesCountToday={opportunitiesDueToday}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Header — oculto na aba de catálogo para ganhar espaço */}
        {activeTab !== 'catalog' && activeTab !== 'dashboard' && activeTab !== 'commissions' && activeTab !== 'opportunities' && activeTab !== 'tecnicos' && (
          <Header
            title={currentHeader.title}
            description={currentHeader.description}
          />
        )}

        {/* Tab Content Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            opportunities={opportunities}
            commissions={commissions}
            setActiveTab={navigate}
            onNewCommission={() => { navigate('commissions'); setIsCommModalOpen(true); }}
            onOpenOpportunities={(filter) => { setOpportunitiesFilter(filter); setActiveTab('opportunities'); }}
            onOpenCommissions={() => {
              const now = new Date();
              setCommissionPeriod({ start: getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)), end: getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0)) });
              setActiveTab('commissions');
            }}
            onNewOpportunity={() => {
              navigate('opportunities');
              setIsOppModalOpen(true);
            }}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            opportunities={opportunities}
            initialFilter={opportunitiesFilter}
            onAddOpportunity={handleAddOpportunity}
            onEditOpportunity={handleEditOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            onRenewOpportunity={handleRenewOpportunity}
            isModalOpen={isOppModalOpen}
            setIsModalOpen={setIsOppModalOpen}
          />
        )}

        {activeTab === 'commissions' && (
          <CommissionsView
            commissions={commissions}
            initialPeriod={commissionPeriod}
            sellers={sellers}
            onAddSeller={handleAddSeller}
            onAddCommission={handleAddCommission}
            onEditCommission={handleEditCommission}
            onDeleteCommission={handleDeleteCommission}
            isModalOpen={isCommModalOpen}
            setIsModalOpen={setIsCommModalOpen}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogQuoteView
            key={user.id}
            userId={user.id}
            products={products}
            templates={templates}
            onSaveTemplate={handleSaveTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
          />
        )}

        {activeTab === 'tecnicos' && (
          <TecnicosBuscadorView />
        )}
      </main>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div role={toastIsError ? "alert" : "status"} className={`fixed bottom-6 right-6 z-[100] max-w-sm px-4 py-3 rounded-xl bg-white border shadow-lg dark:bg-slate-900 font-semibold text-xs flex items-center gap-2 animate-fadeIn ${toastIsError ? "border-red-500 text-red-700 dark:text-red-300" : "border-sky-500/50 text-sky-600 dark:text-sky-300"}`}>
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
