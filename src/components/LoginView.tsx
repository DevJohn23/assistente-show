'use client';
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePendingAction } from '@/lib/usePendingAction';
import { authErrorMessage, requestPasswordReset } from '@/lib/accountAuth';
import { PasswordField } from './AccountView';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="auth-page"><div className="auth-brand"><span className="brand-signature">omnilink<span className="brand-dot">.</span></span><span>Assistente comercial · Show Tecnologia</span></div><section className="ui-panel auth-card">{children}</section><p className="auth-footer">Mais organização para sua rotina comercial.</p></main>;
}

export const LoginView = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetRequested, setResetRequested] = useState(false);
  const { isPending, run } = usePendingAction();
  const switchMode = (next: typeof mode) => { setMode(next); setError(''); setSuccess(''); setPassword(''); setConfirmation(''); setResetRequested(false); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      setError(''); setSuccess('');
      try {
        if(mode === 'forgot') {
          await requestPasswordReset(email); setResetRequested(true);
          setSuccess('Se houver uma conta com esse e-mail, você receberá um link para definir uma nova senha. Confira também o spam.');
        } else if(mode === 'register') {
          if(!fullName.trim()) { setError('Informe seu nome completo.'); return false; }
          if(password !== confirmation) { setError('As senhas não coincidem.'); return false; }
          const { error } = await signUpWithEmail(email.trim(), password, fullName.trim());
          if(error) throw error;
          setMode('login'); setPassword(''); setConfirmation(''); setSuccess('Cadastro solicitado. Confira seu e-mail para confirmar a conta, se necessário, e entre para continuar.');
        } else {
          const { error } = await signInWithEmail(email.trim(), password);
          if(error) throw error;
          setPassword(''); onLoginSuccess?.();
        }
        return true;
      } catch(err) { setError(authErrorMessage(err, mode === 'forgot' ? 'Não foi possível solicitar o link. Tente novamente em alguns minutos.' : 'Não foi possível continuar. Confira sua conexão e os dados informados.')); return false; }
    });
  };
  return <AuthLayout><header className="auth-heading"><h1>{mode === 'login' ? 'Bem-vindo de volta' : mode === 'register' ? 'Crie sua conta' : 'Recuperar senha'}</h1><p>{mode === 'login' ? 'Acesse seus orçamentos, vendas e comissões.' : mode === 'register' ? 'Preencha seus dados para começar.' : 'Informe o e-mail usado para acessar o assistente.'}</p></header>
    <form onSubmit={submit}><fieldset disabled={isPending} className="auth-fields">
      {mode === 'register' && <label className="quote-field">Nome completo<input className="ui-input" required maxLength={100} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} /></label>}
      <label className="quote-field">E-mail<input className="ui-input" required type="email" autoComplete="email" placeholder="seu@email.com.br" value={email} onChange={e => { setEmail(e.target.value); setResetRequested(false); setSuccess(''); }} /></label>
      {mode !== 'forgot' && <PasswordField label="Senha de acesso" value={password} onChange={setPassword} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} />}
      {mode === 'register' && <><p className="auth-hint">Use pelo menos 8 caracteres.</p><PasswordField label="Confirmar senha" value={confirmation} onChange={setConfirmation} minLength={8} /></>}
      {mode === 'login' && <button className="auth-text-button auth-forgot" type="button" onClick={() => switchMode('forgot')}>Esqueci minha senha</button>}
    </fieldset>
    {error && <p role="alert" className="auth-error">{error}</p>}{success && <p role="status" className="auth-success">{success}</p>}
    <button className="ui-button ui-button-primary auth-submit" disabled={isPending || (mode === 'forgot' && resetRequested)}>{isPending ? 'Aguarde…' : mode === 'login' ? 'Acessar o Sistema' : mode === 'register' ? 'Criar conta' : resetRequested ? 'Solicitação enviada' : 'Enviar link de recuperação'}</button>
    </form>
    <div className="auth-secondary">{mode === 'login' ? <><span>Ainda não tem acesso?</span><button className="auth-text-button" disabled={isPending} onClick={() => switchMode('register')}>Cadastrar Novo Vendedor</button></> : <button className="auth-text-button" disabled={isPending} onClick={() => switchMode('login')}>Voltar para o login</button>}</div>
  </AuthLayout>;
};
