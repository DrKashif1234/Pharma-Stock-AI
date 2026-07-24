import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { ExpiryBadge, StockBadge, VialIndicator } from '../components/Badges';
import { formatCurrency, formatDate, formatDateTime, getExpiryStatus, getStockStatus } from '../utils/inventoryLogic';
import MedicineFormModal, { MedicineFormData } from '../components/MedicineFormModal';
import StockAdjustModal from '../components/StockAdjustModal';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { medicines, transactions, settings, updateMedicine, deleteMedicine, adjustStock } = useInventory();
  const medicine = medicines.find((m) => m.id === id);

  const [formOpen, setFormOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const history = useMemo(
    () => transactions.filter((t) => t.medicineId === id),
    [transactions, id],
  );

  if (!medicine) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-ink-700 font-medium">Medicine not found in inventory.</p>
        <button
          onClick={() => navigate('/inventory')}
          className="text-brand-600 text-sm underline underline-offset-2 focus-ring"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  const stockStatus = getStockStatus(medicine);
  const expiryStatus = getExpiryStatus(medicine.expiryDate, settings.expiringSoonWindowDays);

  const rows: [string, string][] = [
    ['Generic Name', medicine.genericName],
    ['Brand Name', medicine.brandName || '—'],
    ['Category', medicine.category],
    ['Strength', medicine.strength],
    ['Dosage Form', medicine.dosageForm],
    ['Batch Number', medicine.batchNumber],
    ['Minimum Stock Level', String(medicine.minStockLevel)],
    ['Unit Price', formatCurrency(medicine.unitPrice, settings.currencySymbol)],
    ['Supplier', medicine.supplier],
    ['Storage Location', medicine.storageLocation],
    ['QR/Barcode ID', medicine.qrCodeId],
  ];

  return (
    <div className="flex flex-col gap-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 w-fit focus-ring"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5 flex flex-col sm:flex-row gap-4">
        <VialIndicator quantity={medicine.quantity} minStockLevel={medicine.minStockLevel} height={64} />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-display font-semibold text-ink-900">{medicine.name}</h1>
              <p className="text-sm text-ink-500">
                {medicine.genericName} · {medicine.strength} · {medicine.dosageForm}
              </p>
            </div>
            <div className="flex gap-1.5">
              <StockBadge status={stockStatus} />
              <ExpiryBadge status={expiryStatus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <p className="text-xs text-ink-500">Current Quantity</p>
              <p className="text-lg font-semibold text-ink-900">{medicine.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Expiry Date</p>
              <p className="text-lg font-semibold text-ink-900">{formatDate(medicine.expiryDate)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setAdjustOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium focus-ring"
            >
              <PlusCircle size={16} /> Adjust Stock
            </button>
            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-base-bg text-ink-700 text-sm font-medium focus-ring"
            >
              <Pencil size={16} /> Edit Medicine
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-status-danger text-sm font-medium focus-ring"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
        <h2 className="font-display font-semibold text-ink-900 mb-3">Medicine Information</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-base-border pb-2">
              <dt className="text-ink-500">{label}</dt>
              <dd className="text-ink-900 font-medium text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
        <h2 className="font-display font-semibold text-ink-900 mb-3">Stock History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-ink-500">No stock transactions recorded yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-base-border">
            {history.map((t) => (
              <li key={t.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-ink-900">{t.type}</p>
                  <p className="text-xs text-ink-500">{formatDateTime(t.date, t.time)}</p>
                </div>
                <p className={`font-semibold ${t.adjustment >= 0 ? 'text-brand-600' : 'text-status-danger'}`}>
                  {t.adjustment >= 0 ? '+' : ''}
                  {t.adjustment} → {t.newQuantity}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <MedicineFormModal
        open={formOpen}
        initial={medicine}
        onClose={() => setFormOpen(false)}
        onSave={(data: MedicineFormData) => {
          updateMedicine(medicine.id, data);
          setFormOpen(false);
        }}
      />

      <StockAdjustModal
        medicine={adjustOpen ? medicine : null}
        onClose={() => setAdjustOpen(false)}
        onAdjust={(delta) => adjustStock(medicine.id, delta, delta > 0 ? 'Stock Added' : 'Stock Removed')}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this medicine?"
        message={`Are you sure you want to delete "${medicine.name}"? This cannot be undone.`}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMedicine(medicine.id);
          navigate('/inventory');
        }}
      />
    </div>
  );
}
