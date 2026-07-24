import { useState } from 'react';
import { FileBarChart, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { getExpiryStatus, getStockStatus, formatDate } from '../utils/inventoryLogic';

interface ReportSection {
  heading: string;
  lines: string[];
}

function parseReport(raw: string): ReportSection[] {
  const sections: ReportSection[] = [];
  let current: ReportSection | null = null;
  raw.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith('##')) {
      current = { heading: trimmed.replace(/^#+\s*/, ''), lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(trimmed.replace(/^-+\s*/, ''));
    } else {
      current = { heading: 'Report', lines: [trimmed] };
      sections.push(current);
    }
  });
  return sections;
}

export default function AIReports() {
  const { medicines, settings } = useInventory();
  const [report, setReport] = useState<ReportSection[] | null>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  async function generateReport() {
    setLoading(true);
    setError(null);
    try {
      const summary = medicines.map((m) => ({
        name: m.name,
        category: m.category,
        quantity: m.quantity,
        minStockLevel: m.minStockLevel,
        unitPrice: m.unitPrice,
        stockStatus: getStockStatus(m),
        expiryDate: m.expiryDate,
        expiryStatus: getExpiryStatus(m.expiryDate, settings.expiringSoonWindowDays),
        batchNumber: m.batchNumber,
        supplier: m.supplier,
      }));

      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryContext: JSON.stringify(summary) }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? 'The AI report could not be generated right now.');
      }

      setRawText(data.report);
      setReport(parseReport(data.report));
      setGeneratedAt(new Date().toLocaleString());
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong generating the report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold text-ink-900">AI Inventory Report</h1>
          <p className="text-sm text-ink-500">
            A structured, AI-generated analysis of {medicines.length} medicines currently on file.
          </p>
        </div>
        <button
          onClick={generateReport}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 disabled:opacity-50 focus-ring w-fit"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <FileBarChart size={16} />}
          {report ? 'Regenerate Report' : 'Generate AI Inventory Report'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-sm text-status-danger bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!report && !loading && !error && (
        <div className="bg-white border border-base-border rounded-xl shadow-card p-10 text-center">
          <FileBarChart size={28} className="mx-auto text-ink-500 mb-3" />
          <p className="text-sm text-ink-500">
            Click "Generate AI Inventory Report" to get an overview, urgent issues, expiry and stock risk, and
            recommended actions based on your current inventory.
          </p>
        </div>
      )}

      {loading && !report && (
        <div className="bg-white border border-base-border rounded-xl shadow-card p-10 text-center text-sm text-ink-500">
          Analyzing inventory data…
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-4">
          {generatedAt && (
            <div className="flex items-center justify-between text-xs text-ink-500">
              <span>Generated {generatedAt}</span>
              <button
                onClick={generateReport}
                className="inline-flex items-center gap-1 hover:text-ink-900 focus-ring"
              >
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
          )}
          {report.map((section, i) => (
            <div key={i} className="bg-white border border-base-border rounded-xl shadow-card p-5">
              <h2 className="font-display font-semibold text-ink-900 mb-2">{section.heading}</h2>
              <ul className="flex flex-col gap-1.5 text-sm text-ink-700">
                {section.lines.map((line, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-brand-500 mt-1.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-xs text-ink-500 italic">
            AI-generated inventory suggestions — verify against current pharmacy policy before acting.
          </p>
        </div>
      )}
    </div>
  );
}
