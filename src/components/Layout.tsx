import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  CalendarClock,
  PackageX,
  ScanLine,
  History,
  Sparkles,
  FileBarChart,
  Settings as SettingsIcon,
  Pill,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/expiry', label: 'Expiry Monitor', icon: CalendarClock },
  { to: '/low-stock', label: 'Low Stock', icon: PackageX },
  { to: '/scanner', label: 'QR Scanner', icon: ScanLine },
  { to: '/history', label: 'Stock History', icon: History },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/reports', label: 'AI Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

// Mobile gets the 5 most-used destinations in the bottom bar; everything
// else stays one tap away via Settings > full menu isn't needed since
// Inventory itself links out to the rest contextually.
const MOBILE_ITEMS = NAV_ITEMS.filter((i) =>
  ['/', '/inventory', '/scanner', '/assistant', '/settings'].includes(i.to),
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-base-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-base-border bg-white sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-base-border">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <Pill size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-semibold text-ink-900 leading-tight">PharmaStock</p>
            <p className="text-xs text-ink-500 leading-tight">AI Inventory</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 thin-scroll">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-colors focus-ring ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-700 hover:bg-base-bg hover:text-ink-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-base-border text-xs text-ink-500">
          No login required — open access for everyone.
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-base-border bg-white sticky top-0 z-20">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Pill size={16} className="text-white" />
          </div>
          <p className="font-display font-semibold text-ink-900">PharmaStock AI</p>
        </header>

        <main className="flex-1 px-4 py-5 md:px-8 md:py-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-base-border flex justify-around items-center py-2 z-30">
          {MOBILE_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium focus-ring ${
                  isActive ? 'text-brand-600' : 'text-ink-500'
                }`
              }
            >
              <Icon size={20} />
              {label.split(' ')[0]}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
