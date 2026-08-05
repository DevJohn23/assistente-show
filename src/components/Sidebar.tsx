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
  const [isHovered, setIsHovered] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Marcos (Vendedor)';
  const userInitial = userName.charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-sky-400',
      badge: null,
    },
    {
      id: 'opportunities',
      label: 'Oportunidades',
      icon: CalendarClock,
      iconColor: 'text-sky-400',
      badge: opportunitiesCountToday > 0 ? opportunitiesCountToday : null,
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    {
      id: 'commissions',
      label: 'Comissões',
      icon: Wallet,
      iconColor: 'text-emerald-400',
      badge: null,
    },
    {
      id: 'catalog',
      label: 'Catálogo / Orçamento',
      icon: ShoppingBag,
      iconColor: 'text-amber-400',
      badge: null,
    },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const isExpanded = isHovered || mobileOpen;

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

      {/* Sidebar Container (Hover Expandable on Desktop + Mobile Drawer) */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed md:sticky top-0 z-50 md:z-30 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen select-none transition-all duration-300 ease-in-out shadow-2xl md:shadow-none overflow-hidden ${
          mobileOpen ? 'left-0 w-64' : '-left-64 md:left-0'
        } ${
          isHovered ? 'md:w-64' : 'md:w-16'
        }`}
      >
        <div className="w-full">
          {/* App Logo & Header - Fixed height to avoid vertical shift */}
          <div className="h-[72px] px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              
              <div className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                isExpanded ? 'opacity-100 max-w-[180px]' : 'opacity-0 max-w-0'
              }`}>
                <h1 className="font-bold text-base text-white tracking-wide font-outfit truncate">Assistente Show</h1>
                <p className="text-[11px] text-slate-400 font-medium truncate">Show Tecnologia • Omnilink</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links - Fixed vertical padding without Menu Principal header */}
          <nav className="p-2.5 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={!isExpanded ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : item.iconColor}`} />
                    <span className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap text-left ${
                      isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0'
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span className={`transition-all duration-300 ease-in-out text-[11px] px-2 py-0.5 rounded-full border font-bold shrink-0 ${item.badgeColor} ${
                      isExpanded ? 'opacity-100 max-w-[50px]' : 'opacity-0 max-w-0 overflow-hidden'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer - Fixed height */}
        <div className="h-[68px] px-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center shrink-0">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {userInitial}
              </div>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                isExpanded ? 'opacity-100 max-w-[140px]' : 'opacity-0 max-w-0'
              }`}>
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
              className={`transition-all duration-300 ease-in-out p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 shrink-0 ${
                isExpanded ? 'opacity-100 max-w-[40px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
