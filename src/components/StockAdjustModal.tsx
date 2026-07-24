import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { Medicine } from '../types';

export default function StockAdjustModal({
  medicine,
  onClose,
  onAdjust,
}: {
  medicine: Medicine | null;
  onClose: () => void;
  onAdjust: (delta: number) => { ok: boolean; error?: string };
}) {
  const [amount, setAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!medicine) return null;

  function apply(sign: 1 | -1) {
    const delta = sign * Math.abs(amount);
    if (delta === 0) return;
    const result = onAdjust(delta);
    if (!result.ok) {
      setError(result.error ?? 'Could not adjust stock.');
      return;
    }
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink-900/40 px-0 md:px-4">
      <div className="bg-white rounded-t-xl md:rounded-xl shadow-card w-full md:max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ink-900">Adjust Stock</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-base-bg focus-ring">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-ink-500 mb-1">{medicine.name}</p>
        <p className="text-2xl font-display font-semibold text-ink-900 mb-4">
          Current Stock: {medicine.quantity}
        </p>

        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            className="w-10 h-10 rounded-full bg-base-bg flex items-center justify-center hover:bg-brand-50 focus-ring"
            aria-label="Decrease amount"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
            className="w-20 text-center rounded-lg border border-base-border py-2 text-lg font-semibold focus-ring"
          />
          <button
            onClick={() => setAmount((a) => a + 1)}
            className="w-10 h-10 rounded-full bg-base-bg flex items-center justify-center hover:bg-brand-50 focus-ring"
            aria-label="Increase amount"
          >
            <Plus size={16} />
          </button>
        </div>

        {error && <p className="text-sm text-status-danger mb-3 text-center">{error}</p>}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => apply(-1)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-status-danger hover:opacity-90 focus-ring"
          >
            Remove Stock
          </button>
          <button
            onClick={() => apply(1)}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 focus-ring"
          >
            Add Stock
          </button>
        </div>
        <p className="text-xs text-ink-500 text-center mt-3">
          New stock would be {Math.max(0, medicine.quantity + amount)} (add) or{' '}
          {Math.max(0, medicine.quantity - amount)} (remove)
        </p>
      </div>
    </div>
  );
}
