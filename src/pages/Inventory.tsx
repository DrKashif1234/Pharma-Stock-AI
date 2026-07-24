import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Medicine } from '../types';
import { getExpiryStatus, getStockStatus } from '../utils/inventoryLogic';
import SearchFilterBar from '../components/SearchFilterBar';
import MedicineList from '../components/MedicineList';
import MedicineFormModal, { MedicineFormData } from '../components/MedicineFormModal';
import StockAdjustModal from '../components/StockAdjustModal';
import ConfirmDialog from '../components/ConfirmDialog';

type SortKey = 'name' | 'quantity' | 'expiryDate' | 'unitPrice';

export default function Inventory() {
  const { medicines, settings, addMedicine, updateMedicine, deleteMedicine, adjustStock } = useInventory();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [expiryStatus, setExpiryStatus] = useState('');
  const [supplier, setSupplier] = useState('');
  const [sort, setSort] = useState<SortKey>('name');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | undefined>(undefined);
  const [adjusting, setAdjusting] = useState<Medicine | null>(null);
  const [deleting, setDeleting] = useState<Medicine | null>(null);

  const categories = useMemo(() => Array.from(new Set(medicines.map((m) => m.category))).sort(), [medicines]);
  const suppliers = useMemo(() => Array.from(new Set(medicines.map((m) => m.supplier))).sort(), [medicines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = medicines.filter((m) => {
      const matchesSearch =
        !q ||
        [m.name, m.genericName, m.brandName, m.batchNumber, m.qrCodeId].some((f) =>
          f.toLowerCase().includes(q),
        );
      const matchesCategory = !category || m.category === category;
      const matchesSupplier = !supplier || m.supplier === supplier;
      const matchesStock = !stockStatus || getStockStatus(m) === stockStatus;
      const matchesExpiry =
        !expiryStatus || getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays) === expiryStatus;
      return matchesSearch && matchesCategory && matchesSupplier && matchesStock && matchesExpiry;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'quantity':
          return b.quantity - a.quantity;
        case 'expiryDate':
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'unitPrice':
          return b.unitPrice - a.unitPrice;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return list;
  }, [medicines, search, category, supplier, stockStatus, expiryStatus, sort, settings.expiringSoonWindowDays]);

  function handleSave(data: MedicineFormData) {
    if (editing) {
      updateMedicine(editing.id, data);
    } else {
      addMedicine({ ...data, isDemo: false } as any);
    }
    setFormOpen(false);
    setEditing(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-ink-900">Inventory</h1>
          <p className="text-sm text-ink-500">{filtered.length} of {medicines.length} medicines shown</p>
        </div>
        <button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 focus-ring w-fit"
        >
          <PlusCircle size={16} /> Add Medicine
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          { key: 'category', label: 'All Categories', value: category, options: categories, onChange: setCategory },
          {
            key: 'stockStatus',
            label: 'All Stock Status',
            value: stockStatus,
            options: ['In Stock', 'Low Stock', 'Out of Stock'],
            onChange: setStockStatus,
          },
          {
            key: 'expiryStatus',
            label: 'All Expiry Status',
            value: expiryStatus,
            options: ['Safe', 'Expiring Soon', 'Expired'],
            onChange: setExpiryStatus,
          },
          { key: 'supplier', label: 'All Suppliers', value: supplier, options: suppliers, onChange: setSupplier },
        ]}
        sort={{
          value: sort,
          onChange: (v) => setSort(v as SortKey),
          options: [
            { value: 'name', label: 'Sort: Name' },
            { value: 'quantity', label: 'Sort: Quantity' },
            { value: 'expiryDate', label: 'Sort: Expiry Date' },
            { value: 'unitPrice', label: 'Sort: Price' },
          ],
        }}
      />

      <MedicineList
        medicines={filtered}
        onEdit={(m) => {
          setEditing(m);
          setFormOpen(true);
        }}
        onDelete={(m) => setDeleting(m)}
        onAdjust={(m) => setAdjusting(m)}
      />

      <MedicineFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        onSave={handleSave}
      />

      <StockAdjustModal
        medicine={adjusting}
        onClose={() => setAdjusting(null)}
        onAdjust={(delta) =>
          adjusting ? adjustStock(adjusting.id, delta, delta > 0 ? 'Stock Added' : 'Stock Removed') : { ok: false }
        }
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this medicine?"
        message={`Are you sure you want to delete "${deleting?.name}"? This cannot be undone.`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMedicine(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
