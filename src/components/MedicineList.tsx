import { useNavigate } from 'react-router-dom';
import { Pencil, PlusCircle, MinusCircle, Trash2 } from 'lucide-react';
import { Medicine } from '../types';
import { ExpiryBadge, StockBadge, VialIndicator } from './Badges';
import { getExpiryStatus, getStockStatus, formatDate, formatCurrency } from '../utils/inventoryLogic';
import { useInventory } from '../context/InventoryContext';

export default function MedicineList({
  medicines,
  onEdit,
  onDelete,
  onAdjust,
}: {
  medicines: Medicine[];
  onEdit: (m: Medicine) => void;
  onDelete: (m: Medicine) => void;
  onAdjust: (m: Medicine) => void;
}) {
  const navigate = useNavigate();
  const { settings } = useInventory();

  if (medicines.length === 0) {
    return (
      <div className="bg-white border border-base-border rounded-xl shadow-card p-10 text-center text-ink-500 text-sm">
        No medicines match your current search and filters.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-base-border rounded-xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-500 border-b border-base-border">
              <th className="px-4 py-3 font-medium">Medicine</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Batch</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => {
              const stockStatus = getStockStatus(m);
              const expiryStatus = getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays);
              return (
                <tr
                  key={m.id}
                  className="border-b last:border-0 border-base-border hover:bg-base-bg/60 cursor-pointer"
                  onClick={() => navigate(`/inventory/${m.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <VialIndicator quantity={m.quantity} minStockLevel={m.minStockLevel} height={32} />
                      <div>
                        <p className="font-medium text-ink-900">{m.name}</p>
                        <p className="text-xs text-ink-500">
                          {m.genericName} · {m.strength}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{m.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{m.batchNumber}</td>
                  <td className="px-4 py-3 text-ink-900">
                    {m.quantity} <span className="text-ink-500">/ min {m.minStockLevel}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{formatDate(m.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <StockBadge status={stockStatus} />
                      <ExpiryBadge status={expiryStatus} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="Adjust stock"
                        onClick={() => onAdjust(m)}
                        className="p-2 rounded-lg hover:bg-brand-50 text-brand-600 focus-ring"
                      >
                        <PlusCircle size={16} />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => onEdit(m)}
                        className="p-2 rounded-lg hover:bg-base-bg text-ink-700 focus-ring"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => onDelete(m)}
                        className="p-2 rounded-lg hover:bg-red-50 text-status-danger focus-ring"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {medicines.map((m) => {
          const stockStatus = getStockStatus(m);
          const expiryStatus = getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays);
          return (
            <div
              key={m.id}
              onClick={() => navigate(`/inventory/${m.id}`)}
              className="bg-white border border-base-border rounded-xl shadow-card p-4"
            >
              <div className="flex gap-3">
                <VialIndicator quantity={m.quantity} minStockLevel={m.minStockLevel} height={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink-900">{m.name}</p>
                      <p className="text-xs text-ink-500">
                        {m.genericName} · {m.strength}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-ink-900 shrink-0">
                      {formatCurrency(m.unitPrice, useInventoryCurrency())}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <StockBadge status={stockStatus} />
                    <ExpiryBadge status={expiryStatus} />
                  </div>
                  <p className="text-xs text-ink-500 mt-2">
                    Stock {m.quantity} / min {m.minStockLevel} · Expires {formatDate(m.expiryDate)}
                  </p>
                </div>
              </div>
              <div
                className="flex gap-2 mt-3 pt-3 border-t border-base-border"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onAdjust(m)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium focus-ring"
                >
                  <PlusCircle size={14} /> Stock
                </button>
                <button
                  onClick={() => onEdit(m)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-base-bg text-ink-700 text-xs font-medium focus-ring"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => onDelete(m)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-status-danger text-xs font-medium focus-ring"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Small helper so the mobile card can access the currency symbol without
// threading it through every prop call above.
function useInventoryCurrency() {
  return useInventory().settings.currencySymbol;
}
