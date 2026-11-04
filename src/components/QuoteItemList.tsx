'use client';

import { useId, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { GripVertical } from 'lucide-react';
import type { CartItem } from '@/types';

interface Props {
  items: CartItem[];
  enabled: boolean;
  onMove: (id: string, targetId: string, after: boolean) => void;
  renderHeading: (item: CartItem) => ReactNode;
  renderControls: (item: CartItem) => ReactNode;
}

export function QuoteItemList({ items, enabled, onMove, renderHeading, renderControls }: Props) {
  const helpId = useId();
  const list = useRef<HTMLUListElement>(null);
  const gesture = useRef<{ id: string; y: number; active: boolean } | null>(null);
  const [drag, setDrag] = useState<{ id: string; target: string; after: boolean } | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const reset = () => { gesture.current = null; setDrag(null); };
  const move = (id: string, target: string, after: boolean) => {
    onMove(id, target, after);
    setAnnouncement(`${items.find(item => item.product.id === id)?.product.name}: posição atualizada.`);
  };
  const pointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!enabled || !current) return;
    if (!current.active && Math.abs(event.clientY - current.y) < 5) return;
    current.active = true;
    const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-quote-item]');
    if (!row || !list.current?.contains(row)) { setDrag(null); return; }
    const rect = row.getBoundingClientRect();
    setDrag({ id: current.id, target: row.dataset.quoteItem!, after: event.clientY > rect.top + rect.height / 2 });
    const scroller = list.current.closest('.quote-panel-body');
    if (scroller) {
      const bounds = scroller.getBoundingClientRect();
      if (event.clientY > bounds.bottom - 45) scroller.scrollTop += 18;
      if (event.clientY < bounds.top + 45) scroller.scrollTop -= 18;
    }
  };
  return <>
    <span id={helpId} className="sr-only">Arraste para reorganizar ou use as setas para cima e para baixo. Escape cancela o arraste.</span>
    <span role="status" className="sr-only">{announcement}</span>
    <ul ref={list} className="quote-items">{items.map((item, index) => <li key={item.product.id} data-quote-item={item.product.id}
      className={enabled && drag ? `${drag.id === item.product.id ? 'quote-item-dragging' : ''} ${drag.target === item.product.id && drag.id !== drag.target ? (drag.after ? 'quote-drop-after' : 'quote-drop-before') : ''}` : ''}>
      <div className="quote-item-heading">
        {enabled && items.length > 1 && <button type="button" className="quote-drag-handle" aria-label={`Reorganizar ${item.product.name}`} aria-describedby={helpId}
          title="Arraste para reorganizar · ↑/↓ pelo teclado"
          onPointerDown={event => {
            if (event.button !== 0) return;
            event.currentTarget.focus();
            gesture.current = { id: item.product.id, y: event.clientY, active: false };
            event.currentTarget.setPointerCapture(event.pointerId);
          }} onPointerMove={pointerMove}
          onPointerUp={event => {
            if (enabled && gesture.current?.active && drag && drag.id !== drag.target) move(drag.id, drag.target, drag.after);
            reset();
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }} onPointerCancel={reset} onLostPointerCapture={reset}
          onKeyDown={event => {
            if (event.key === 'Escape') { reset(); return; }
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            const next = index + (event.key === 'ArrowUp' ? -1 : 1);
            if (items[next]) move(item.product.id, items[next].product.id, next > index);
          }}><GripVertical size={14} aria-hidden="true" /></button>}
        {renderHeading(item)}
      </div>
      {renderControls(item)}
    </li>)}</ul>
  </>;
}
