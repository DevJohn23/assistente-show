'use client';
import dynamic from 'next/dynamic';
const OrganizationExplorer = dynamic(() => import('@/components/organization/OrganizationExplorer'), { ssr: false, loading: () => <div className="org-loading" role="status">Preparando o organograma…</div> });
export default function OrganizationPage() { return <OrganizationExplorer />; }
