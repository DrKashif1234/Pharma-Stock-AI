import { Search } from 'lucide-react';

export interface FilterSelect {
  key: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = 'Search by name, generic, brand, batch, or QR ID…',
  filters = [],
  sort,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterSelect[];
  sort?: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void };
}) {
  return (
    <div className="bg-white border border-base-border rounded-xl shadow-card p-3 flex flex-col md:flex-row gap-3 md:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-base-border text-sm focus-ring"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="rounded-lg border border-base-border px-2.5 py-2 text-sm bg-white focus-ring"
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ))}
        {sort && (
          <select
            value={sort.value}
            onChange={(e) => sort.onChange(e.target.value)}
            className="rounded-lg border border-base-border px-2.5 py-2 text-sm bg-white focus-ring"
          >
            {sort.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
