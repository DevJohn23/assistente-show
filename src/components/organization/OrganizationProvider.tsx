'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchOrganization } from '@/lib/organizationService';
import { Employee, OrganizationData } from '@/types/organization';

interface OrganizationContextValue extends OrganizationData {
  loading: boolean; error: boolean; reload: () => Promise<boolean>;
  getPhoto: (employee: Employee) => Promise<string>;
}
const Context = createContext<OrganizationContextValue | null>(null);
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<OrganizationData>({ employees: [], departments: [], canManage: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const revision = useRef(0);
  const cache = useRef(new Map<string, Promise<string>>());
  const urls = useRef(new Set<string>());
  const mounted = useRef(true);
  const reload = useCallback(async () => {
    const version = ++revision.current;
    setLoading(true); setError(false);
    try {
      const next = await fetchOrganization();
      if (mounted.current && revision.current === version) setData(next);
      return true;
    } catch {
      if (mounted.current && revision.current === version) setError(true);
      return false;
    } finally { if (mounted.current && revision.current === version) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    setData({ employees: [], departments: [], canManage: false });
    if (user) void reload();
    return () => {
      mounted.current = false; revision.current++;
      urls.current.forEach(URL.revokeObjectURL); urls.current.clear(); cache.current.clear();
    };
  }, [user?.id, reload]);
  const getPhoto = useCallback((employee: Employee) => {
    if (!employee.photo_path) return Promise.resolve('');
    const key = `${employee.id}:${employee.photo_path}`;
    const old = cache.current.get(key); if (old) return old;
    const pending = (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return '';
      const response = await fetch(`/api/organograma/fotos/${encodeURIComponent(employee.id)}`, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store' });
      if (!response.ok) return '';
      const blob = await response.blob();
      if (!mounted.current) return '';
      const url = URL.createObjectURL(blob); urls.current.add(url); return url;
    })().catch(() => '');
    cache.current.set(key, pending); return pending;
  }, []);
  return <Context.Provider value={{ ...data, canManage: data.canManage && !error, loading, error, reload, getPhoto }}>{children}</Context.Provider>;
}
export function useOrganization() {
  const value = useContext(Context); if (!value) throw new Error('OrganizationProvider required'); return value;
}
export function EmployeeAvatar({ employee, size = 44 }: { employee: Employee; size?: number }) {
  const { getPhoto } = useOrganization();
  const [url, setUrl] = useState('');
  useEffect(() => {
    let active = true; setUrl('');
    void getPhoto(employee).then(value => { if (active) setUrl(value); });
    return () => { active = false; };
  }, [employee.id, employee.photo_path, getPhoto]);
  const initials = employee.name.split(/\s+/).filter(Boolean).map(n => n[0]).slice(0, 2).join('');
  return <span className="org-avatar" style={{ width: size, height: size, fontSize: Math.max(12, size * .29) }}>
    {url ? <img src={url} alt="" width={size} height={size} onError={() => setUrl('')} /> : <span aria-hidden="true">{initials}</span>}
  </span>;
}
