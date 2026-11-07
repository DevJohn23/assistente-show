'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, Package, ChevronUp, ChevronDown } from 'lucide-react';

export function QuoteDialog({ children, label, onClose, canClose = true, fullScreen = false, className = '' }: {
  children: React.ReactNode; label: string; onClose: () => void; canClose?: boolean; fullScreen?: boolean; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!mounted) return;
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, [mounted]);
  if (!mounted) return null;
  return createPortal(<dialog ref={ref} aria-label={label} className={`quote-dialog ${className} ${fullScreen ? 'quote-dialog-full' : ''}`}
    onCancel={event => { event.preventDefault(); if (canClose) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && canClose) onClose(); }}>
    <div className="quote-dialog-content">{children}</div>
  </dialog>, document.body);
}

/** Click, keyboard and touch all work; holding a pointer repeats until released. */
export function QuantityControl({ name, quantity, onChange }: { name: string; quantity: number; onChange: (delta: number) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const repeated = useRef(false);
  const change = useRef(onChange);
  change.current = onChange;
  const stop = () => { clearTimeout(timer.current); };
  useEffect(() => () => clearTimeout(timer.current), []);
  const handlers = (delta: number) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      repeated.current = false;
      const tick = () => { repeated.current = true; change.current(delta); timer.current = setTimeout(tick, 150); };
      timer.current = setTimeout(tick, 450);
    },
    onPointerUp: stop, onPointerCancel: stop, onLostPointerCapture: stop, onBlur: stop,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => { if (!repeated.current || event.detail === 0) change.current(delta); repeated.current = false; },
  });
  return <div className="quote-quantity" role="group" aria-label={`Quantidade de ${name}`}>
    <button type="button" aria-label={`Diminuir quantidade de ${name}`} {...handlers(-1)}><Minus size={15} /></button>
    <output aria-label={`Quantidade de ${name}`}>{quantity}</output>
    <button type="button" aria-label={`Aumentar quantidade de ${name}`} {...handlers(1)}><Plus size={15} /></button>
  </div>;
}

export function ProductImage({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return src && !failed
    ? <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
    : <span className="product-image-fallback" role="img" aria-label={`${name}: imagem indisponível`}><Package size={36} strokeWidth={1.3} /></span>;
}

export function UnitPriceInput({ name, value, onCommit }: { name: string; value: number; onCommit: (value: number | undefined) => void }) {
  const [draft, setDraft] = useState(String(value));
  const cancelled = useRef(false);
  useEffect(() => setDraft(String(value)), [value]);
  return <label className="quote-price-label">Valor unitário (R$)
    <input className="ui-input" aria-label={`Valor unitário de ${name}`} type="number" min="0" step="1" value={draft}
      onChange={event => setDraft(event.target.value)}
      onKeyDown={event => {
        if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
        if (event.key === 'Escape') { event.stopPropagation(); cancelled.current = true; setDraft(String(value)); event.currentTarget.blur(); }
      }}
      onBlur={() => {
        if (cancelled.current) { cancelled.current = false; return; }
        const parsed = Number(draft);
        if (draft.trim() === '') { setDraft(String(value)); onCommit(undefined); }
        else if (Number.isFinite(parsed) && parsed >= 0) onCommit(parsed);
        else setDraft(String(value));
      }} />
  </label>;
}

/** Text input accepts either decimal separator; explicit steppers preserve fractions. */
export function PercentageInput({ label, value, onChange, max }: {
  label: string; value: number; onChange: (value: number) => void; max?: number;
}) {
  const format = (number: number) => number ? String(number).replace('.', ',') : '';
  const [draft, setDraft] = useState(() => format(value));
  const bound = (number: number) => Math.round(Math.min(max ?? Number.MAX_SAFE_INTEGER / 100, Math.max(0, number)) * 100) / 100;
  useEffect(() => {
    setDraft(previous => Number(previous.replace(',', '.')) === value ? previous : format(value));
  }, [value]);
  const step = (delta: number) => {
    const next = bound(value + delta);
    setDraft(format(next)); onChange(next);
  };
  return <label className="quote-field">{label}<span className="quote-percentage-control">
    <input className="ui-input" type="text" inputMode="decimal" role="spinbutton" aria-label={label}
      aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} value={draft} placeholder="0"
      onChange={event => {
        const text = event.target.value;
        if (!/^\d*(?:[.,]\d{0,2})?$/.test(text)) return;
        const parsed = Number(text.replace(',', '.'));
        if (!Number.isFinite(parsed)) { setDraft(text); return; }
        const next = bound(parsed);
        setDraft(next !== parsed ? format(next) : text);
        onChange(next);
      }}
      onBlur={() => setDraft(format(value))}
      onKeyDown={event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); step(event.key === 'ArrowUp' ? 1 : -1); }
        if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
      }} />
    <span className="quote-percentage-steppers">
      <button type="button" aria-label={`Aumentar ${label}`} disabled={max !== undefined && value >= max} onClick={() => step(1)}><ChevronUp size={12} /></button>
      <button type="button" aria-label={`Diminuir ${label}`} disabled={value <= 0} onClick={() => step(-1)}><ChevronDown size={12} /></button>
    </span>
  </span></label>;
}
