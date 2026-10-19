'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { QuoteDialog } from '../QuoteControls';
import { QuoteSnapshot, money } from '@/lib/quotePresentation';
import type { ProposalDetails } from './ProposalDocument';
import { getLocalDateString } from '@/lib/dateUtils';

export default function ProposalDialog({ quote, seller, contact, onClose }: { quote: QuoteSnapshot; seller: string; contact: string; onClose: () => void }) {
  const [snapshot] = useState(quote);
  const [details, setDetails] = useState<ProposalDetails>(() => ({ client: quote.client, issued: getLocalDateString(), validUntil: '', includeSeller: false, seller, contact, notes: '' }));
  const [url, setUrl] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const active = useRef(true), running = useRef(false), blobUrl = useRef('');
  useEffect(() => { active.current = true; return () => { active.current = false; if (blobUrl.current) URL.revokeObjectURL(blobUrl.current); }; }, []);
  const patch = (change: Partial<ProposalDetails>) => { setDetails(d => ({ ...d, ...change })); if (blobUrl.current) URL.revokeObjectURL(blobUrl.current); blobUrl.current = ''; setUrl(''); setError(''); };
  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); if (running.current) return;
    if (details.validUntil && details.validUntil < details.issued) { setError('A validade não pode ser anterior à emissão.'); return; }
    running.current = true; setBusy(true); setError('');
    try {
      const { generateProposal } = await import('./ProposalDocument');
      // Fetch only the bundled logo. No customer data is sent to a generation service.
      const response = await fetch('/brand/omnilink-original.png');
      if (!response.ok) throw new Error('Logo unavailable');
      const logo = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject;
        void response.blob().then(blob => reader.readAsDataURL(blob), reject);
      });
      const blob = await generateProposal(snapshot, details, logo);
      if (!active.current) return;
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = URL.createObjectURL(blob); setUrl(blobUrl.current);
    } catch { if (active.current) setError('Não foi possível gerar o PDF. Seus dados foram preservados. Tente novamente.'); }
    finally { running.current = false; if (active.current) setBusy(false); }
  };
  return <QuoteDialog label="Proposta comercial" onClose={onClose} canClose={!busy} className="proposal-dialog"><div className="quote-preview">
    <header className="quote-modal-heading"><div><h2>Proposta comercial</h2><p className="ui-muted">Revise os dados e visualize antes de baixar.</p></div><button className="ui-icon-button" aria-label="Fechar proposta" disabled={busy} onClick={onClose}><X size={20} /></button></header>
    <div className="proposal-summary"><strong>{snapshot.lines.length} {snapshot.lines.length === 1 ? 'produto' : 'produtos'}</strong><span>Equipamentos: R$ {money(snapshot.total)}</span>{snapshot.monthly > 0 && <span>Mensalidade: R$ {money(snapshot.monthly)}</span>}</div>
    <p className="ui-muted text-sm mb-4">Produtos e condições vêm do orçamento. Para alterá-los, feche esta janela e edite o orçamento.</p>
    <form onSubmit={generate}><fieldset disabled={busy} className="proposal-fields">
      <label className="quote-field">Cliente (opcional)<input className="ui-input" maxLength={150} value={details.client} onChange={e => patch({ client: e.target.value })} /><small>Sem nome, a seção Cliente não aparece no PDF.</small></label>
      <label className="quote-field">Data de emissão<input className="ui-input" type="date" required value={details.issued} onChange={e => patch({ issued: e.target.value })} /></label>
      <label className="quote-field">Válida até (opcional)<input className="ui-input" type="date" min={details.issued} value={details.validUntil} onChange={e => patch({ validUntil: e.target.value })} /></label>
      <label className="quote-model-choice proposal-notes"><input type="checkbox" checked={details.includeSeller} onChange={e => patch({ includeSeller: e.target.checked })} /><span><strong>Incluir responsável comercial</strong><small>Exibe nome e contato do responsável no documento.</small></span></label>
      {details.includeSeller && <><label className="quote-field">Responsável comercial<input className="ui-input" maxLength={100} value={details.seller} onChange={e => patch({ seller: e.target.value })} /></label>
      <label className="quote-field">Contato do responsável<input className="ui-input" maxLength={150} value={details.contact} onChange={e => patch({ contact: e.target.value })} /></label></>}
      <label className="quote-field proposal-notes">Observações (opcional)<textarea className="ui-input" maxLength={1200} rows={3} value={details.notes} onChange={e => patch({ notes: e.target.value })} placeholder="Ex.: prazo de instalação acordado com o cliente." /></label>
    </fieldset>
    {error && <p className="quote-error" role="alert">{error}</p>}
    <footer className="quote-modal-actions"><button className="ui-button ui-button-secondary" type="button" disabled={busy} onClick={onClose}>Voltar ao orçamento</button><button className="ui-button ui-button-primary" disabled={busy}><FileText size={17} />{busy ? 'Gerando PDF…' : url ? 'Atualizar prévia' : 'Visualizar PDF'}</button></footer></form>
    {busy && <p role="status" className="ui-muted text-sm">Preparando o documento…</p>}
    {url && <section className="proposal-preview" aria-label="Prévia do PDF"><div className="proposal-download"><p role="status">Proposta pronta para revisão.</p><a className="ui-button ui-button-primary" href={url} download={`proposta-comercial-${details.issued}.pdf`}><Download size={17} />Baixar PDF</a></div><iframe title="Prévia da proposta comercial" src={url} /><p className="ui-muted text-sm">Se a prévia não abrir neste navegador, use Baixar PDF.</p></section>}
  </div></QuoteDialog>;
}
