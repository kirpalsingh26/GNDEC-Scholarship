import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: {
    (toast: Omit<ToastItem, 'id'>): void;
    (type: ToastType, message: string, title?: string, duration?: number): void;
  };
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (...args: [Omit<ToastItem, 'id'>] | [ToastType, string, string?, number?]) => {
      let toastData: Omit<ToastItem, 'id'>;

      if (typeof args[0] === 'object' && args[0] !== null) {
        toastData = args[0] as Omit<ToastItem, 'id'>;
      } else {
        const [type, message, title, duration = 4000] = args as [ToastType, string, string?, number?];
        toastData = { type, message, title, duration };
      }

      const id = Math.random().toString(36).substring(2, 9);
      const duration = toastData.duration ?? 4000;
      setToasts((prev) => [...prev, { ...toastData, id, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastHelpers = {
    success: (message: string, title?: string) => addToast('success', message, title),
    error: (message: string, title?: string) => addToast('error', message, title),
    info: (message: string, title?: string) => addToast('info', message, title),
    warning: (message: string, title?: string) => addToast('warning', message, title),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast: toastHelpers }}>
      {children}
      {/* Toast Notification Floating Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          const icon = isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : isError ? (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          ) : isWarning ? (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          );

          const borderColors = isSuccess
            ? 'border-emerald-200 bg-white shadow-emerald-500/10'
            : isError
            ? 'border-rose-200 bg-white shadow-rose-500/10'
            : isWarning
            ? 'border-amber-200 bg-white shadow-amber-500/10'
            : 'border-indigo-200 bg-white shadow-indigo-500/10';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 ${borderColors} animate-in slide-in-from-bottom-5`}
            >
              {icon}
              <div className="flex-1 min-w-0 text-xs">
                {t.title && <h5 className="font-extrabold text-slate-900 mb-0.5">{t.title}</h5>}
                <p className="text-slate-600 font-medium leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
