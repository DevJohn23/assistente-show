'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/Sidebar';
import { LoginView } from '@/components/LoginView';
import { OrganizationProvider } from '@/components/organization/OrganizationProvider';
import './organization.css';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter();
  if (loading) return <div className="app-loading" role="status">Verificando acesso…</div>;
  if (!user) return <LoginView />;
  return <OrganizationProvider key={user.id}><div className="app-shell org-shell">
    <Sidebar activeTab="organograma" setActiveTab={tab => router.push(tab === 'organograma' ? '/organograma' : `/?tab=${tab}`)} opportunitiesCountToday={0} />
    <main className="org-main">{children}</main>
  </div></OrganizationProvider>;
}
