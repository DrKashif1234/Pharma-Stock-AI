import { ExpiryStatus, StockStatus } from '../types';

export function StockBadge({ status }: { status: StockStatus }) {
  const styles: Record<StockStatus, string> = {
    'In Stock': 'bg-brand-50 text-brand-700',
    'Low Stock': 'bg-amber-50 text-status-warn',
    'Out of Stock': 'bg-red-50 text-status-danger',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export function ExpiryBadge({ status }: { status: ExpiryStatus }) {
  const styles: Record<ExpiryStatus, string> = {
    Safe: 'bg-brand-50 text-brand-700',
    'Expiring Soon': 'bg-amber-50 text-status-warn',
    Expired: 'bg-red-50 text-status-danger',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

/**
 * Signature element: renders stock level as a literal fill height inside a
 * vial-shaped bar, echoing a medicine vial. Used next to every medicine row
 * so stock health is visible at a glance without reading numbers.
 */
export function VialIndicator({
  quantity,
  minStockLevel,
  height = 40,
}: {
  quantity: number;
  minStockLevel: number;
  height?: number;
}) {
  const ceiling = Math.max(minStockLevel * 3, quantity, 1);
  const pct = Math.min(100, Math.max(quantity <= 0 ? 4 : 8, (quantity / ceiling) * 100));
  const color = quantity <= 0 ? '#C4453D' : quantity <= minStockLevel ? '#C98A1D' : '#0F6E5E';

  return (
    <div className="vial" style={{ height }} title={`${quantity} units in stock`}>
      <div className="vial-fill" style={{ height: `${pct}%`, background: color }} />
    </div>
  );
}
