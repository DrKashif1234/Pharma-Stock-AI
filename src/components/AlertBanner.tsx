import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface AlertItem {
  message: string;
  to: string;
  tone: 'warn' | 'danger';
}

export default function AlertBanner({ alerts }: { alerts: AlertItem[] }) {
  const navigate = useNavigate();
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white border border-base-border rounded-xl shadow-card divide-y divide-base-border overflow-hidden">
      {alerts.map((a, i) => (
        <button
          key={i}
          onClick={() => navigate(a.to)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-base-bg transition-colors focus-ring ${
            a.tone === 'danger' ? 'text-status-danger' : 'text-status-warn'
          }`}
        >
          <AlertTriangle size={16} className="shrink-0" />
          {a.message}
        </button>
      ))}
    </div>
  );
}
