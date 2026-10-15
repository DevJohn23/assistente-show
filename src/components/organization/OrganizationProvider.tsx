'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchOrganization } from '@/lib/organizationService';
import { Employee, OrganizationData } from '@/types/organization';
import { OrganizationPhotoCache, organizationPhotoKey, organizationPhotoVersion } from '@/lib/organizationPhotoCache';

interface OrganizationContextValue extends OrganizationData {
  loading: boolean; error: boolean; reload: () => Promise<boolean>;
  getPhoto: (employee: Employee) => Promise<string>;
  applyEmployee: (employee: Employee, photo?: Blob) => void;
}
const Context = createContext<OrganizationContextValue | null>(null);
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<OrganizationData>({ employees: [], departments: [], canManage: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const revision = useRef(0);
  const cache = useRef(new OrganizationPhotoCache());
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
      cache.current.dispose();
    };
  }, [user?.id, reload]);
  const getPhoto = useCallback((employee: Employee) => {
    if (!employee.photo_path) return Promise.resolve('');
    return cache.current.load(organizationPhotoKey(employee), async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const version = encodeURIComponent(organizationPhotoVersion(employee.photo_path));
      const response = await fetch(`/api/organograma/fotos/${encodeURIComponent(employee.id)}?v=${version}`, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'default' });
      return response.ok ? response.blob() : null;
    });
  }, []);
  const applyEmployee = useCallback((employee: Employee, photo?: Blob) => {
    if (photo && employee.photo_path) cache.current.prime(organizationPhotoKey(employee), photo);
    setData(previous => ({ ...previous, employees: previous.employees.some(e => e.id === employee.id)
      ? previous.employees.map(e => e.id === employee.id ? employee : e)
      : [...previous.employees, employee] }));
  }, []);
  return <Context.Provider value={{ ...data, canManage: data.canManage && !error, loading, error, reload, getPhoto, applyEmployee }}>{children}</Context.Provider>;
}
export function useOrganization() {
  const value = useContext(Context); if (!value) throw new Error('OrganizationProvider required'); return value;
}
export function EmployeeAvatar({ employee, size = 44 }: { employee: Employee; size?: number }) {
  const { getPhoto } = useOrganization();
  const key = organizationPhotoKey(employee);
  const [image, setImage] = useState({ key: '', url: '' });
  const url = image.key === key ? image.url : '';
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async (attempt: number) => {
      const value = await getPhoto(employee);
      if (!active) return;
      setImage({ key, url: value });
      if (!value && employee.photo_path && attempt < 2) timer = setTimeout(() => void load(attempt + 1), 500 * (attempt + 1));
    };
    void load(0);
    return () => { active = false; clearTimeout(timer); };
  }, [employee.id, employee.photo_path, key, getPhoto]);
  const initials = employee.name.split(/\s+/).filter(Boolean).map(n => n[0]).slice(0, 2).join('');
  return <span className="org-avatar" style={{ width: size, height: size, fontSize: Math.max(12, size * .29) }}>
    {url ? <img src={url} alt="" width={size} height={size} decoding="async" onError={() => setImage({ key, url: '' })} /> : <span aria-hidden="true">{initials}</span>}
  </span>;
}
