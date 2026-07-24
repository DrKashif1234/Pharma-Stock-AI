import { useMemo } from 'react';
import { Boxes, PackagePlus, PackageX, CalendarClock, Ban } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import AlertBanner, { AlertItem } from '../components/AlertBanner';
import { useInventory } from '../context/InventoryContext';
import { getExpiryStatus, getStockStatus } from '../utils/inventoryLogic';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { medicines, settings, clearDemoData } = useInventory();
  const hasDemoData = medicines.some((m) => m.isDemo);

  const stats = useMemo(() => {
    let totalStock = 0;
    let lowStock = 0;
    let expiringSoon = 0;
    let expired = 0;

    medicines.forEach((m) => {
      totalStock += m.quantity;
      const stockStatus = getStockStatus(m);
      if (stockStatus === 'Low Stock' || stockStatus === 'Out of Stock') lowStock += 1;
      const expiryStatus = getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays);
      if (expiryStatus === 'Expiring Soon') expiringSoon += 1;
      if (expiryStatus === 'Expired') expired += 1;
    });

    return { totalMedicines: medicines.length, totalStock, lowStock, expiringSoon, expired };
  }, [medicines, settings.expiringSoonWindowDays]);

  const alerts: AlertItem[] = [];
  if (stats.expired > 0) {
    alerts.push({
      message: `${stats.expired} medicine${stats.expired > 1 ? 's are' : ' is'} already expired.`,
      to: '/expiry',
      tone: 'danger',
    });
  }
  if (stats.expiringSoon > 0) {
    alerts.push({
      message: `${stats.expiringSoon} medicine${stats.expiringSoon > 1 ? 's are' : ' is'} expiring within ${settings.expiringSoonWindowDays} days.`,
      to: '/expiry',
      tone: 'warn',
    });
  }
  if (stats.lowStock > 0) {
    alerts.push({
      message: `${stats.lowStock} medicine${stats.lowStock > 1 ? 's are' : ' is'} below minimum stock.`,
      to: '/low-stock',
      tone: 'warn',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-500">Overview of your pharmacy inventory.</p>
        </div>
        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 focus-ring w-fit"
        >
          <PackagePlus size={16} /> Add Medicine
        </Link>
      </div>

      {hasDemoData && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
          <span className="text-brand-700">
            You're viewing <strong>Demo Inventory Data</strong>. Add your own medicines any time.
          </span>
          <button
            onClick={clearDemoData}
            className="text-brand-700 underline underline-offset-2 hover:text-brand-900 focus-ring w-fit"
          >
            Clear demo data
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard label="Total Medicines" value={stats.totalMedicines} icon={Boxes} to="/inventory" />
        <SummaryCard label="Total Stock" value={stats.totalStock} icon={PackagePlus} to="/inventory" />
        <SummaryCard label="Low Stock" value={stats.lowStock} icon={PackageX} tone="warn" to="/low-stock" />
        <SummaryCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          icon={CalendarClock}
          tone="warn"
          to="/expiry"
        />
        <SummaryCard label="Expired" value={stats.expired} icon={Ban} tone="danger" to="/expiry" />
      </div>

      {alerts.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink-700 mb-2">Alerts</h2>
          <AlertBanner alerts={alerts} />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/assistant"
          className="bg-white border border-base-border rounded-xl shadow-card p-5 hover:-translate-y-0.5 transition-transform focus-ring"
        >
          <p className="font-display font-semibold text-ink-900 mb-1">Ask PharmaStock AI Assistant</p>
          <p className="text-sm text-ink-500">
            Which medicines are expiring soon? What needs restocking? Ask in plain language.
          </p>
        </Link>
        <Link
          to="/reports"
          className="bg-white border border-base-border rounded-xl shadow-card p-5 hover:-translate-y-0.5 transition-transform focus-ring"
        >
          <p className="font-display font-semibold text-ink-900 mb-1">Generate AI Inventory Report</p>
          <p className="text-sm text-ink-500">
            A structured overview of urgent issues, expiry risk, and recommended actions.
          </p>
        </Link>
      </div>
    </div>
  );
}
