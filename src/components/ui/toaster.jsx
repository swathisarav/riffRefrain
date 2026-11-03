import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

let toasts = [];
let nextId = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l(toasts));

function dismiss(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** toast({ title, description?, variant?: 'default' | 'destructive' }) */
export function toast({ title, description, variant = 'default' }) {
  const id = ++nextId;
  toasts = [...toasts, { id, title, description, variant }];
  emit();
  setTimeout(() => dismiss(id), variant === 'destructive' ? 6000 : 3500);
}

export const toastError = (err, title = 'Something went wrong') =>
  toast({ title, description: err?.message ?? String(err), variant: 'destructive' });

export function Toaster() {
  const [list, setList] = useState(toasts);

  useEffect(() => {
    listeners.add(setList);
    return () => listeners.delete(setList);
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 z-[60] flex flex-col gap-2 sm:w-80"
    >
      {list.map((t) => {
        const Icon = t.variant === 'destructive' ? AlertCircle : CheckCircle2;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 shadow-lg bg-white animate-[toast-in_.2s_ease-out]',
              t.variant === 'destructive' ? 'border-red-200' : 'border-stone-200',
            )}
          >
            <Icon className={cn('size-5 shrink-0', t.variant === 'destructive' ? 'text-red-600' : 'text-emerald-600')} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-sm text-stone-500 break-words">{t.description}</p>}
            </div>
            <button onClick={() => dismiss(t.id)} className="text-stone-400 hover:text-stone-700" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
