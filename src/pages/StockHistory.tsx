import { useMemo, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { formatDateTime } from '../utils/inventoryLogic';
import { Search } from 'lucide-react';
import { TransactionType } from '../types';

export default function StockHistory() {
  const { transactions } = useInventory();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchesSearch = !q || t.medicineName.toLowerCase().includes(q);
      const matchesType = !type || t.type === type;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, type]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-900">Stock History</h1>
        <p className="text-sm text-ink-500">Every stock adjustment, recorded automatically.</p>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medicine name"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-base-border text-sm focus-ring"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType | '')}
          className="rounded-lg border border-base-border px-2.5 py-2 text-sm bg-white focus-ring"
        >
          <option value="">All Transaction Types</option>
          <option value="Stock Added">Stock Added</option>
          <option value="Stock Removed">Stock Removed</option>
          <option value="Manual Adjustment">Manual Adjustment</option>
        </select>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">No transactions match your search.</p>
        ) : (
          <ul className="divide-y divide-base-border">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{t.medicineName}</p>
                  <p className="text-xs text-ink-500">
                    {t.type} · {formatDateTime(t.date, t.time)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold ${t.adjustment >= 0 ? 'text-brand-600' : 'text-status-danger'}`}>
                    {t.adjustment >= 0 ? '+' : ''}
                    {t.adjustment}
                  </p>
                  <p className="text-xs text-ink-500">
                    {t.previousQuantity} → {t.newQuantity}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
