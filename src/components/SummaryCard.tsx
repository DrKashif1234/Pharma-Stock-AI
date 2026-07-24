import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
  to,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'warn' | 'danger';
  to?: string;
}) {
  const navigate = useNavigate();
  const toneStyles = {
    default: { bg: 'bg-brand-50', text: 'text-brand-700', icon: 'text-brand-500' },
    warn: { bg: 'bg-amber-50', text: 'text-status-warn', icon: 'text-status-warn' },
    danger: { bg: 'bg-red-50', text: 'text-status-danger', icon: 'text-status-danger' },
  }[tone];

  return (
    <button
      onClick={() => to && navigate(to)}
      className={`text-left w-full bg-white border border-base-border rounded-xl shadow-card p-4 flex items-center justify-between transition-transform ${
        to ? 'hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
      } focus-ring`}
    >
      <div>
        <p className="text-xs font-medium text-ink-500 mb-1">{label}</p>
        <p className="text-2xl font-display font-semibold text-ink-900">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${toneStyles.bg} flex items-center justify-center`}>
        <Icon size={20} className={toneStyles.icon} />
      </div>
    </button>
  );
}
