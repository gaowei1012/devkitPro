import { CheckCircle2, XCircle } from 'lucide-react';
import { useToastStore, type ToastItem } from '@/stores/toastStore';

function ToastMessage({ toast }: { toast: ToastItem }) {
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg backdrop-blur-sm ${
        isSuccess
          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/90 dark:text-green-200'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((item) => (
        <ToastMessage key={item.id} toast={item} />
      ))}
    </div>
  );
}
