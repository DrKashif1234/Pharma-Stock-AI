import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DosageForm, Medicine } from '../types';
import { generateId } from '../utils/inventoryLogic';

const DOSAGE_FORMS: DosageForm[] = [
  'Tablet',
  'Capsule',
  'Syrup',
  'Injection',
  'Ointment',
  'Drops',
  'Inhaler',
  'Suspension',
  'Cream',
  'Other',
];

export type MedicineFormData = Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'isDemo'>;

const EMPTY_FORM: MedicineFormData = {
  name: '',
  genericName: '',
  brandName: '',
  category: '',
  strength: '',
  dosageForm: 'Tablet',
  batchNumber: '',
  quantity: 0,
  minStockLevel: 10,
  unitPrice: 0,
  expiryDate: '',
  supplier: '',
  storageLocation: '',
  qrCodeId: '',
};

const REQUIRED_FIELDS: (keyof MedicineFormData)[] = [
  'name',
  'genericName',
  'category',
  'strength',
  'batchNumber',
  'expiryDate',
  'supplier',
  'storageLocation',
];

export default function MedicineFormModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Medicine;
  onClose: () => void;
  onSave: (data: MedicineFormData) => void;
}) {
  const [form, setForm] = useState<MedicineFormData>(initial ?? { ...EMPTY_FORM, qrCodeId: generateId('QR') });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(initial ?? { ...EMPTY_FORM, qrCodeId: `QR-${generateId('').toUpperCase()}` });
      setErrors({});
    }
  }, [open, initial]);

  if (!open) return null;

  function update<K extends keyof MedicineFormData>(key: K, value: MedicineFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    REQUIRED_FIELDS.forEach((f) => {
      if (!String(form[f] ?? '').trim()) next[f] = 'Required';
    });
    if (form.quantity < 0) next.quantity = 'Cannot be negative';
    if (form.minStockLevel < 0) next.minStockLevel = 'Cannot be negative';
    if (form.unitPrice < 0) next.unitPrice = 'Cannot be negative';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  const field = (label: string, key: keyof MedicineFormData, type: string = 'text', extra?: React.ReactNode) => (
    <label className="block">
      <span className="text-xs font-medium text-ink-700">{label}</span>
      {extra ?? (
        <input
          type={type}
          value={form[key] as string | number}
          onChange={(e) =>
            update(key, (type === 'number' ? Number(e.target.value) : e.target.value) as any)
          }
          className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus-ring ${
            errors[key] ? 'border-status-danger' : 'border-base-border'
          }`}
        />
      )}
      {errors[key] && <span className="text-xs text-status-danger">{errors[key]}</span>}
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink-900/40 px-0 md:px-4">
      <div className="bg-white rounded-t-xl md:rounded-xl shadow-card w-full md:max-w-2xl max-h-[92vh] overflow-y-auto thin-scroll">
        <div className="flex items-center justify-between px-5 py-4 border-b border-base-border sticky top-0 bg-white z-10">
          <h3 className="font-display font-semibold text-ink-900">
            {initial ? 'Edit Medicine' : 'Add Medicine'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-base-bg focus-ring">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Medicine Name *', 'name')}
          {field('Generic Name *', 'genericName')}
          {field('Brand Name', 'brandName')}
          {field('Category *', 'category')}
          {field('Strength *', 'strength')}
          {field(
            'Dosage Form',
            'dosageForm',
            'text',
            <select
              value={form.dosageForm}
              onChange={(e) => update('dosageForm', e.target.value as DosageForm)}
              className="mt-1 w-full rounded-lg border border-base-border px-3 py-2 text-sm focus-ring bg-white"
            >
              {DOSAGE_FORMS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>,
          )}
          {field('Batch Number *', 'batchNumber')}
          {field('Quantity', 'quantity', 'number')}
          {field('Minimum Stock Level', 'minStockLevel', 'number')}
          {field('Unit Price', 'unitPrice', 'number')}
          {field('Expiry Date *', 'expiryDate', 'date')}
          {field('Supplier *', 'supplier')}
          {field('Storage Location *', 'storageLocation')}
          {field('QR/Barcode ID', 'qrCodeId')}

          <div className="sm:col-span-2 flex justify-end gap-2 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-ink-700 hover:bg-base-bg focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 focus-ring"
            >
              {initial ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
