import { useMemo, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { getStockStatus } from '../utils/inventoryLogic';
import { useNavigate } from 'react-router-dom';
import { StockBadge, VialIndicator } from '../components/Badges';
import StockAdjustModal from '../components/StockAdjustModal';
import { Medicine } from '../types';

export default function LowStock() {
  const { medicines, adjustStock } = useInventory();
  const navigate = useNavigate();
  const [adjusting, setAdjusting] = useState<Medicine | null>(null);

  const items = useMemo(
    () =>
      medicines
        .filter((m) => getStockStatus(m) !== 'In Stock')
        .sort((a, b) => a.quantity - b.quantity),
    [medicines],
  );

  const outOfStock = items.filter((m) => m.quantity === 0);
  const lowStock = items.filter((m) => m.quantity > 0);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-900">Low Stock Monitor</h1>
        <p className="text-sm text-ink-500">
          Medicines at or below their minimum stock level, sorted by most urgent first.
        </p>
      </div>

      <Section title={`Out of Stock (${outOfStock.length})`} tone="danger">
        {outOfStock.map((m) => (
          <Row key={m.id} m={m} onOpen={() => navigate(`/inventory/${m.id}`)} onAdjust={() => setAdjusting(m)} />
        ))}
        {outOfStock.length === 0 && <EmptyRow />}
      </Section>

      <Section title={`Low Stock (${lowStock.length})`} tone="warn">
        {lowStock.map((m) => (
          <Row key={m.id} m={m} onOpen={() => navigate(`/inventory/${m.id}`)} onAdjust={() => setAdjusting(m)} />
        ))}
        {lowStock.length === 0 && <EmptyRow />}
      </Section>

      <StockAdjustModal
        medicine={adjusting}
        onClose={() => setAdjusting(null)}
        onAdjust={(delta) =>
          adjusting ? adjustStock(adjusting.id, delta, delta > 0 ? 'Stock Added' : 'Stock Removed') : { ok: false }
        }
      />
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone: 'danger' | 'warn'; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-base-border rounded-xl shadow-card overflow-hidden">
      <div
        className={`px-4 py-3 text-sm font-medium border-b border-base-border ${
          tone === 'danger' ? 'text-status-danger' : 'text-status-warn'
        }`}
      >
        {title}
      </div>
      <ul className="divide-y divide-base-border">{children}</ul>
    </div>
  );
}

function EmptyRow() {
  return <li className="px-4 py-6 text-center text-sm text-ink-500">Nothing here right now.</li>;
}

function Row({ m, onOpen, onAdjust }: { m: any; onOpen: () => void; onAdjust: () => void }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-base-bg/60">
      <div onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
        <VialIndicator quantity={m.quantity} minStockLevel={m.minStockLevel} height={32} />
        <div className="min-w-0">
          <p className="font-medium text-ink-900 truncate">{m.name}</p>
          <p className="text-xs text-ink-500">
            Stock {m.quantity} / min {m.minStockLevel} · {m.supplier}
          </p>
        </div>
      </div>
      <StockBadge status={getStockStatus(m)} />
      <button
        onClick={onAdjust}
        className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium focus-ring shrink-0"
      >
        Restock
      </button>
    </li>
  );
}
