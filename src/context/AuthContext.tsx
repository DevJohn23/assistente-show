'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser?.email) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .ilike('email', currentUser.email.trim())
        .maybeSingle();
      
      const isDbAdmin = !!data && !error;
      const isEnvAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL === currentUser.email;
      
      console.log('Admin Check:', { dbAdmin: isDbAdmin, envAdmin: isEnvAdmin, email: currentUser.email });
      setIsAdmin(isDbAdmin || isEnvAdmin);
    } catch (e) {
      console.error('Error checking admin status', e);
      setIsAdmin(process.env.NEXT_PUBLIC_ADMIN_EMAIL === currentUser.email);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null).finally(() => setLoading(false));
    });

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Supabase returns user with empty identities array if user email already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { 
          error: new Error('Este e-mail já está cadastrado no sistema. Por favor, faça login ou utilize outro e-mail.') 
        };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
