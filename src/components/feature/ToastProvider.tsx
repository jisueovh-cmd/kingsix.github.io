import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<ToastType, { icon: string; accent: string }> = {
  success: { icon: 'ri-checkbox-circle-line', accent: 'text-accent-600' },
  error: { icon: 'ri-error-warning-line', accent: 'text-primary-600' },
  info: { icon: 'ri-information-line', accent: 'text-secondary-600' },
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      const timer = setTimeout(() => dismiss(id), 3500);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((item) => {
          const style = TYPE_STYLES[item.type];
          return (
            <div
              key={item.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-lg border border-background-200 bg-background-50/95 px-4 py-3 shadow-sm backdrop-blur"
            >
              <i className={`${style.icon} ${style.accent} mt-0.5 text-lg`} />
              <p className="min-w-0 flex-1 break-words text-sm leading-relaxed text-foreground-800">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="닫기"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-foreground-400 transition-colors hover:text-foreground-700 cursor-pointer"
              >
                <i className="ri-close-line text-base" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}