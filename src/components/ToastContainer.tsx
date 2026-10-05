import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useExchange } from '../context/ExchangeContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useExchange();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-2xl transition-all"
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-[#F6465D] shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--text-primary)]">{t.title}</div>
            {t.description && (
              <div className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                {t.description}
              </div>
            )}
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
