import { supabase } from './supabase';

export function authErrorMessage(error: unknown, fallback: string) {
  const code = (error as { code?: string })?.code;
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (code === 'weak_password') return 'Escolha uma senha mais forte, com letras, números e símbolos.';
  if (code === 'same_password') return 'A nova senha deve ser diferente da atual.';
  if (code === 'invalid_credentials' || code === 'invalid_password') return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (code === 'reauthentication_needed' || code === 'session_not_found') return 'Entre novamente na sua conta antes de alterar a senha.';
  return fallback;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/recuperar-senha`,
  });
  if (error) throw error;
}

export async function updateAccountName(name: string) {
  const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
  if (error) throw error;
}

export async function changeAccountPassword(email: string, currentPassword: string, password: string) {
  try { sessionStorage.removeItem('omnilink_recovery_user'); } catch { /* Optional recovery marker. */ }
  // Reconfirm the current credential even when the project does not require it server-side.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) throw verifyError;
  const { error } = await supabase.auth.updateUser({ password, current_password: currentPassword });
  if (error) throw error;
}
