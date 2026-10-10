'use client';

import React from 'react';
import { usePendingAction } from '@/lib/usePendingAction';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  const { isPending, run } = usePendingAction();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl relative">
        <button
          disabled={isPending}
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            disabled={isPending}
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            disabled={isPending}
            onClick={() => run(async () => { await onConfirm(); return true; })}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {isPending ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
