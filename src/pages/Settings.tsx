import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Settings() {
  const { settings, updateSettings, medicines, clearDemoData } = useInventory();
  const [confirmClear, setConfirmClear] = useState(false);
  const hasDemoData = medicines.some((m) => m.isDemo);

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Preferences for how PharmaStock AI displays your inventory.</p>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5 flex flex-col gap-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-700">"Expiring Soon" window (days)</span>
          <input
            type="number"
            min={1}
            value={settings.expiringSoonWindowDays}
            onChange={(e) => updateSettings({ expiringSoonWindowDays: Math.max(1, Number(e.target.value)) })}
            className="mt-1 w-full rounded-lg border border-base-border px-3 py-2 text-sm focus-ring"
          />
          <span className="text-xs text-ink-500">
            Medicines expiring within this many days are flagged as "Expiring Soon" on the Dashboard and Expiry Monitor.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-ink-700">Currency Symbol</span>
          <input
            value={settings.currencySymbol}
            onChange={(e) => updateSettings({ currencySymbol: e.target.value || '$' })}
            className="mt-1 w-24 rounded-lg border border-base-border px-3 py-2 text-sm focus-ring"
          />
        </label>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
        <h2 className="font-display font-semibold text-ink-900 mb-1">Demo Inventory Data</h2>
        <p className="text-sm text-ink-500 mb-3">
          {hasDemoData
            ? 'Your inventory currently includes sample demo medicines. Remove them whenever you\'re ready to work with your own data — this only removes items marked as demo data.'
            : 'No demo data remaining in your inventory.'}
        </p>
        <button
          disabled={!hasDemoData}
          onClick={() => setConfirmClear(true)}
          className="px-4 py-2 rounded-lg bg-red-50 text-status-danger text-sm font-medium disabled:opacity-40 focus-ring"
        >
          Clear Demo Data
        </button>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
        <h2 className="font-display font-semibold text-ink-900 mb-1">Access</h2>
        <p className="text-sm text-ink-500">
          PharmaStock AI has no login, accounts, or access restrictions. All features are available to everyone
          who opens the app, and all data is stored locally in this browser.
        </p>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear demo data?"
        message="This removes all demo medicines from your inventory. Medicines you've added yourself are not affected."
        confirmLabel="Clear Demo Data"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearDemoData();
          setConfirmClear(false);
        }}
      />
    </div>
  );
}
