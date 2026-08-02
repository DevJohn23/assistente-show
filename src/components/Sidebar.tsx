'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Wallet, 
  ShoppingBag, 
  Sparkles,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  opportunitiesCountToday: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  opportunitiesCountToday 
}) => {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Marcos (Vendedor)';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'opportunities',
      label: 'Oportunidades',
      icon: CalendarClock,
      badge: opportunitiesCountToday > 0 ? opportunitiesCountToday : null,
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    {
      id: 'commissions',
      label: 'Comissões',
      icon: Wallet,
      badge: null,
    },
    {
      id: 'catalog',
      label: 'Catálogo / Orçamento',
      icon: ShoppingBag,
      badge: null,
    },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header Bar (< md) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white font-outfit">Assistente Show</h1>
            <p className="text-[10px] text-slate-400 font-medium">Show Tecnologia</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Abrir Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fadeIn"
        />
      )}

      {/* Sidebar Container (Desktop Sidebar + Mobile Drawer) */}
      <aside 
        className={`fixed md:sticky top-0 z-50 md:z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen select-none transition-all duration-300 ${
          mobileOpen ? 'left-0' : '-left-64 md:left-0'
        }`}
      >
        <div>
          {/* App Logo & Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base text-white tracking-wide font-outfit">Assistente Show</h1>
                <p className="text-[11px] text-slate-400 font-medium">Show Tecnologia • Omnilink</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-500 uppercase mb-2">Menu Principal</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online (Supabase)
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sair da Conta"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
