'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardView } from '@/components/DashboardView';
import { OpportunitiesView } from '@/components/OpportunitiesView';
import { CommissionsView } from '@/components/CommissionsView';
import { CatalogQuoteView } from '@/components/CatalogQuoteView';
import { LoginView } from '@/components/LoginView';

import { useAuth } from '@/context/AuthContext';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_COMMISSIONS, 
  INITIAL_TEMPLATES,
  INITIAL_SELLERS
} from '@/lib/mockData';
import { Opportunity, Commission, QuoteTemplate } from '@/types';
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
} from '@/lib/supabaseServices';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('assistente_show_active_tab');
      if (saved && ['dashboard', 'opportunities', 'commissions', 'catalog'].includes(saved)) {
        return saved;
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('assistente_show_active_tab', activeTab);
    }
  }, [activeTab]);

  // Application State
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [commissions, setCommissions] = useState<Commission[]>(INITIAL_COMMISSIONS);
  const [sellers, setSellers] = useState<string[]>(INITIAL_SELLERS);
  const [templates, setTemplates] = useState<QuoteTemplate[]>(INITIAL_TEMPLATES);
  const [products] = useState(INITIAL_PRODUCTS);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Modal open triggers
  const [isOppModalOpen, setIsOppModalOpen] = useState(false);
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    async function loadUserSupabaseData() {
      setIsDataLoading(true);
      const [oppsData, commsData, sellersData, tplsData] = await Promise.all([
        fetchOpportunities(user!.id),
        fetchCommissions(user!.id),
        fetchSellers(user!.id),
        fetchQuoteTemplates(user!.id),
      ]);

      setOpportunities(oppsData);
      setCommissions(commsData);
      setSellers(sellersData);
      setTemplates(tplsData);
      setIsDataLoading(false);
    }

    loadUserSupabaseData();
  }, [user]);

  // If Auth is loading, show clean loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/25 animate-bounce mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Carregando Assistente Show...</p>
      </div>
    );
  }

  // If user is not logged in, render Login screen
  if (!user) {
    return <LoginView />;
  }

  // Opportunity Handlers
  const handleAddOpportunity = async (opp: Omit<Opportunity, 'id' | 'user_id'>) => {
    const payload = { ...opp, user_id: user.id };
    const saved = await createOpportunity(payload);
    
    if (saved) {
      setOpportunities((prev) => [saved, ...prev]);
      showToast('Oportunidade salva no Supabase.');
    } else {
      const fallback: Opportunity = { ...opp, id: `opp-${Date.now()}`, user_id: user.id };
      setOpportunities((prev) => [fallback, ...prev]);
      showToast('Oportunidade registrada (Modo Offline).');
    }
  };

  const handleEditOpportunity = async (id: string, updated: Partial<Opportunity>) => {
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated } : o))
    );
    await updateOpportunity(id, updated);
    showToast('Oportunidade atualizada.');
  };

  const handleDeleteOpportunity = async (id: string) => {
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    await deleteOpportunity(id);
    showToast('Oportunidade excluída.');
  };

  const handleRenewOpportunity = async (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;

    const daysToAdd = opp.type === 'PF' ? 15 : 30;
    const currentExp = new Date(opp.expiration_date + 'T00:00:00');
    currentExp.setDate(currentExp.getDate() + daysToAdd);
    const newExp = currentExp.toISOString().split('T')[0];

    const updated = { expiration_date: newExp, status: 'renewed' as const };
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updated } : o))
    );
    await updateOpportunity(id, updated);
    showToast(`Oportunidade renovada (+${daysToAdd} dias para ${opp.type})!`);
  };

  // Commission Handlers
  const handleAddCommission = async (comm: Omit<Commission, 'id' | 'user_id'>) => {
    const payload = { ...comm, user_id: user.id };
    const saved = await createCommission(payload);

    if (saved) {
      setCommissions((prev) => [saved, ...prev]);
      showToast('Venda gravada no Supabase.');
    } else {
      const fallback: Commission = { ...comm, id: `comm-${Date.now()}`, user_id: user.id };
      setCommissions((prev) => [fallback, ...prev]);
      showToast('Venda registrada.');
    }
  };

  const handleEditCommission = async (id: string, updated: Partial<Commission>) => {
    setCommissions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    await updateCommission(id, updated);
    showToast('Venda / Observação atualizada.');
  };

  const handleDeleteCommission = async (id: string) => {
    setCommissions((prev) => prev.filter((c) => c.id !== id));
    await deleteCommission(id);
    showToast('Registro excluído.');
  };

  const handleAddSeller = async (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !sellers.includes(trimmed)) {
      setSellers((prev) => [...prev, trimmed]);
      await createSeller(user.id, trimmed);
      showToast(`Vendedor "${trimmed}" cadastrado.`);
    }
  };

  // Save Template Handler
  const handleSaveTemplate = async (name: string, items: { product_id: string; quantity: number }[]) => {
    const payload = { user_id: user.id, name, items };
    const saved = await createQuoteTemplate(payload);

    if (saved) {
      setTemplates((prev) => [...prev, saved]);
    } else {
      const fallback: QuoteTemplate = { id: `tpl-${Date.now()}`, ...payload };
      setTemplates((prev) => [...prev, fallback]);
    }
    showToast('Modelo de Orçamento salvo!');
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
  };

  const currentHeader = headerContent[activeTab] || headerContent.dashboard;

  const todayStr = new Date().toISOString().split('T')[0];
  const opportunitiesDueToday = opportunities.filter((o) => o.expiration_date === todayStr).length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0b0f19] text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        opportunitiesCountToday={opportunitiesDueToday}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <Header
          title={currentHeader.title}
          description={currentHeader.description}
        />

        {/* Tab Content Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            opportunities={opportunities}
            commissions={commissions}
            setActiveTab={setActiveTab}
            onNewOpportunity={() => {
              setActiveTab('opportunities');
              setIsOppModalOpen(true);
            }}
          />
        )}

        {activeTab === 'opportunities' && (
          <OpportunitiesView
            opportunities={opportunities}
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
            products={products}
            templates={templates}
            onSaveTemplate={handleSaveTemplate}
          />
        )}
      </main>

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/50 text-sky-300 font-semibold text-xs shadow-xl flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
