import { useMemo, useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ExpiryBucket, daysUntil, getExpiryBucket, formatDate } from '../utils/inventoryLogic';
import { useNavigate } from 'react-router-dom';
import { VialIndicator } from '../components/Badges';

const BUCKET_ORDER: ExpiryBucket[] = ['Expired', 'Within 30 Days', 'Within 60 Days', 'Within 90 Days', 'Safe'];

const BUCKET_STYLES: Record<ExpiryBucket, string> = {
  Expired: 'bg-red-50 text-status-danger border-status-danger/20',
  'Within 30 Days': 'bg-amber-50 text-status-warn border-status-warn/20',
  'Within 60 Days': 'bg-amber-50/60 text-status-warn border-status-warn/10',
  'Within 90 Days': 'bg-blue-50 text-status-info border-status-info/20',
  Safe: 'bg-brand-50 text-brand-700 border-brand-100',
};

type SortMode = 'earliest' | 'latest' | 'name';

export default function ExpiryMonitor() {
  const { medicines } = useInventory();
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<SortMode>('earliest');
  const [activeBucket, setActiveBucket] = useState<ExpiryBucket | 'All'>('All');

  const grouped = useMemo(() => {
    const map: Record<ExpiryBucket, typeof medicines> = {
      Expired: [],
      'Within 30 Days': [],
      'Within 60 Days': [],
      'Within 90 Days': [],
      Safe: [],
    };
    medicines.forEach((m) => {
      map[getExpiryBucket(m.expiryDate)].push(m);
    });
    return map;
  }, [medicines]);

  const list = useMemo(() => {
    let items = activeBucket === 'All' ? medicines : grouped[activeBucket];
    items = [...items].sort((a, b) => {
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      const diff = daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
      return sortMode === 'earliest' ? diff : -diff;
    });
    return items;
  }, [activeBucket, grouped, medicines, sortMode]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-900">Expiry Monitor</h1>
        <p className="text-sm text-ink-500">Track medicines by how urgently they need attention.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveBucket('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border focus-ring ${
            activeBucket === 'All' ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-base-border'
          }`}
        >
          All ({medicines.length})
        </button>
        {BUCKET_ORDER.map((b) => (
          <button
            key={b}
            onClick={() => setActiveBucket(b)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border focus-ring ${
              activeBucket === b ? 'bg-ink-900 text-white border-ink-900' : `${BUCKET_STYLES[b]}`
            }`}
          >
            {b} ({grouped[b].length})
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="rounded-lg border border-base-border px-2.5 py-2 text-sm bg-white focus-ring"
        >
          <option value="earliest">Sort: Earliest Expiry</option>
          <option value="latest">Sort: Latest Expiry</option>
          <option value="name">Sort: Medicine Name</option>
        </select>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">No medicines in this category.</p>
        ) : (
          <ul className="divide-y divide-base-border">
            {list.map((m) => {
              const d = daysUntil(m.expiryDate);
              const bucket = getExpiryBucket(m.expiryDate);
              return (
                <li
                  key={m.id}
                  onClick={() => navigate(`/inventory/${m.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-base-bg/60 cursor-pointer"
                >
                  <VialIndicator quantity={m.quantity} minStockLevel={m.minStockLevel} height={32} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">{m.name}</p>
                    <p className="text-xs text-ink-500">
                      Batch {m.batchNumber} · Expires {formatDate(m.expiryDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${BUCKET_STYLES[bucket]}`}>
                      {bucket}
                    </span>
                    <p className="text-xs text-ink-500 mt-1">
                      {d < 0 ? `${Math.abs(d)} days ago` : `in ${d} days`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
