'use client';
import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePendingAction } from '@/lib/usePendingAction';
import { authErrorMessage, changeAccountPassword, updateAccountName } from '@/lib/accountAuth';
import { QuotePreferences } from './QuotePreferences';
import { QuoteDialog } from './QuoteControls';

export function PasswordField({ label, value, onChange, autoComplete = 'new-password', minLength }: {
  label: string; value: string; onChange: (value: string) => void; autoComplete?: string; minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return <label className="quote-field">{label}<div className="password-field"><input className="ui-input" aria-label={label} type={visible ? 'text' : 'password'} required minLength={minLength} autoComplete={autoComplete} value={value} onChange={e => onChange(e.target.value)} /><button type="button" className="ui-icon-button" aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>;
}

export function AccountView({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [tab, setTab] = useState<'profile' | 'password' | 'preferences'>('profile');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { isPending, run } = usePendingAction();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await run(async () => {
      setError(''); setSuccess('');
      if(tab === 'profile' && !name.trim()) { setError('Informe seu nome.'); return false; }
      if(tab === 'password' && password !== confirmation) { setError('As senhas não coincidem.'); return false; }
      if(tab === 'password' && password === current) { setError('A nova senha deve ser diferente da atual.'); return false; }
      try {
        if(tab === 'profile') { await updateAccountName(name); setName(name.trim()); setSuccess('Nome atualizado.'); }
        else { await changeAccountPassword(user!.email!, current, password); setCurrent(''); setPassword(''); setConfirmation(''); setSuccess('Senha alterada com sucesso.'); }
        return true;
      } catch(err) { setError(authErrorMessage(err, 'Não foi possível salvar. Confira sua conexão e tente novamente.')); return false; }
    });
  };
  return <QuoteDialog label="Minha conta" onClose={onClose} canClose={!isPending}><div className="quote-preview account-settings">
    <header className="quote-modal-heading"><div><h2>Minha conta</h2><p className="ui-muted">Seus dados e acesso ao assistente.</p></div><button className="ui-icon-button" aria-label="Fechar minha conta" disabled={isPending} onClick={onClose}><X size={20} /></button></header>
    <div className="account-sections" role="group" aria-label="Seções da conta">{([['profile','Dados pessoais'],['password','Senha'],['preferences','Preferências']] as const).map(([value,label]) => <button type="button" key={value} disabled={isPending} aria-pressed={tab === value} onClick={() => { setTab(value); setError(''); setSuccess(''); setCurrent(''); setPassword(''); setConfirmation(''); }}>{label}</button>)}</div>
    {tab === 'preferences' ? <QuotePreferences key={user?.id} /> : <form onSubmit={submit}><fieldset disabled={isPending} className="auth-fields">{tab === 'profile' ? <><label className="quote-field">Nome completo<input className="ui-input" required maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label><label className="quote-field">E-mail<input className="ui-input" type="email" value={user?.email || ''} readOnly /></label></> : <><PasswordField label="Senha atual" value={current} onChange={setCurrent} autoComplete="current-password" /><PasswordField label="Nova senha" value={password} onChange={setPassword} minLength={8} /><p className="auth-hint">Use pelo menos 8 caracteres. Prefira uma senha exclusiva para esta conta.</p><PasswordField label="Confirmar nova senha" value={confirmation} onChange={setConfirmation} minLength={8} /></>}</fieldset>
      {error && <p className="auth-error" role="alert">{error}</p>}{success && <p className="auth-success" role="status">{success}</p>}
      <footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" type="button" disabled={isPending} onClick={onClose}>Fechar</button><button className="ui-button ui-button-primary" disabled={isPending}>{isPending ? 'Salvando…' : tab === 'profile' ? 'Salvar nome' : 'Alterar senha'}</button></footer>
    </form>}
  </div></QuoteDialog>;
}
