'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/accountAuth';
import { usePendingAction } from '@/lib/usePendingAction';
import { AuthLayout } from '@/components/LoginView';
import { PasswordField } from '@/components/AccountView';

export default function RecoverPasswordPage() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const { isPending, run } = usePendingAction();
  useEffect(() => {
    let active = true;
    let recoveryEvent = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if(event === 'PASSWORD_RECOVERY') recoveryEvent = true;
      if(event === 'SIGNED_OUT' && active) setStatus('invalid');
    });
    const verify = async () => {
      try {
        const { error: initError } = await supabase.auth.initialize();
        if(initError || new URLSearchParams(window.location.hash.slice(1)).has('error')) throw new Error('Invalid recovery link');
        const { data, error } = await supabase.auth.getUser();
        let markedUser: string | null = null;
        try { markedUser = sessionStorage.getItem('omnilink_recovery_user'); } catch { /* Event works without storage. */ }
        if(error || !data.user || (!recoveryEvent && markedUser !== data.user.id)) throw new Error('Recovery session required');
        if(active) setStatus('ready');
      } catch { if(active) setStatus('invalid'); }
    };
    void verify();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      setError('');
      if(password !== confirmation) { setError('As senhas não coincidem.'); return false; }
      try {
        const { error } = await supabase.auth.updateUser({ password });
        if(error) throw error;
        try { sessionStorage.removeItem('omnilink_recovery_user'); } catch { /* No credentials stored. */ }
        setPassword(''); setConfirmation(''); setStatus('done'); return true;
      } catch(err) { setError(authErrorMessage(err, 'Não foi possível salvar a senha. Tente novamente ou solicite um novo link.')); return false; }
    });
  };
  return <AuthLayout><header className="auth-heading"><h1>{status === 'done' ? 'Senha atualizada' : 'Defina sua nova senha'}</h1><p>{status === 'done' ? 'Você já pode continuar usando o assistente.' : 'Escolha uma senha exclusiva para sua conta.'}</p></header>
    {status === 'checking' && <p role="status">Verificando o link…</p>}
    {status === 'invalid' && <><p className="auth-error" role="alert">Este link é inválido ou expirou. Volte ao login e solicite um novo link em “Esqueci minha senha”.</p><Link className="ui-button ui-button-secondary auth-submit" href="/">Voltar ao início</Link></>}
    {status === 'ready' && <form onSubmit={submit}><fieldset disabled={isPending} className="auth-fields"><PasswordField label="Nova senha" value={password} onChange={setPassword} minLength={8} /><p className="auth-hint">Use pelo menos 8 caracteres.</p><PasswordField label="Confirmar nova senha" value={confirmation} onChange={setConfirmation} minLength={8} /></fieldset>{error && <p role="alert" className="auth-error">{error}</p>}<button className="ui-button ui-button-primary auth-submit" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar nova senha'}</button></form>}
    {status === 'done' && <Link className="ui-button ui-button-primary auth-submit" href="/">Acessar o sistema</Link>}
  </AuthLayout>;
}
