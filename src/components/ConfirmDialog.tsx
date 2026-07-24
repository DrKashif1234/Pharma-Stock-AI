import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-card max-w-sm w-full p-5">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <AlertTriangle size={20} className="text-status-danger" />
        </div>
        <h3 className="font-display font-semibold text-ink-900 mb-1">{title}</h3>
        <p className="text-sm text-ink-500 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-base-bg focus-ring"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-status-danger text-white hover:opacity-90 focus-ring"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
