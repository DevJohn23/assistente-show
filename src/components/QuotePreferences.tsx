'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { usePendingAction } from '@/lib/usePendingAction';
import { quotePreferences, quoteModelLabels, quoteMessage, QuoteModel, QuoteSnapshot } from '@/lib/quotePresentation';

const example: QuoteSnapshot = { client: 'Cliente exemplo', lines: [{ id: 'prod-1', name: 'OMNITURBO (Kit Omniturbo)', quantity: 1, unitPrice: 6930, total: 6930 }], subtotal: 6930, discountPercent: 0, discount: 0, total: 6930, entry: 0, balance: 6930, monthly: 205.86, payments: [{ label: 'PIX à vista', amount: 6930 }], financing: [] };
export function QuotePreferences() {
  const { user } = useAuth();
  const [draft, setDraft] = useState(() => quotePreferences(user?.user_metadata?.quote_preferences));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { isPending, run } = usePendingAction();
  return <form className="quote-preferences" onSubmit={event => {
    event.preventDefault();
    void run(async () => {
      setError(''); setMessage('');
      try {
        if (!user) throw new Error('No session');
        const { error } = await supabase.auth.updateUser({ data: { quote_preferences: draft } });
        if (error) throw error;
        setMessage('Preferências salvas. Os próximos orçamentos usarão este modelo.'); return true;
      } catch { setError('Não foi possível salvar as preferências. Tente novamente.'); return false; }
    });
  }}>
    <fieldset disabled={isPending} className="auth-fields"><legend className="font-semibold mb-3">Modelo da mensagem</legend>
      {(Object.keys(quoteModelLabels) as QuoteModel[]).map(model => <label className="quote-model-choice" key={model}>
        <input type="radio" name="quote-model" value={model} checked={draft.model === model} onChange={() => { setDraft({ ...draft, model }); setMessage(''); }} />
        <span><strong>{quoteModelLabels[model]}</strong><small>{model === 'basic' ? 'Mensagem atual, objetiva e com emojis.' : model === 'detailed' ? 'Inclui os componentes dos kits Omniturbo e Omnidual.' : 'Linguagem direta, sem emojis.'}</small></span>
      </label>)}
      <details className="quote-model-preview"><summary>Ver exemplo da mensagem</summary><pre>{quoteMessage(example, draft.model)}</pre></details>
      <label className="quote-model-choice"><input type="checkbox" checked={draft.pdfEnabled} onChange={event => { setDraft({ ...draft, pdfEnabled: event.target.checked }); setMessage(''); }} /><span><strong>Habilitar proposta em PDF</strong><small>Exibe “Gerar proposta PDF” abaixo de “Copiar mensagem”.</small></span></label>
    </fieldset>
    {error && <p role="alert" className="auth-error">{error}</p>}{message && <p role="status" className="auth-success">{message}</p>}
    <footer className="quote-modal-actions"><button className="ui-button ui-button-primary" disabled={isPending}>{isPending ? 'Salvando…' : 'Salvar preferências'}</button></footer>
  </form>;
}
