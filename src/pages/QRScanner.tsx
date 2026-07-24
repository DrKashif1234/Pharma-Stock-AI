import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, ScanLine, PlusCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { StockBadge, VialIndicator } from '../components/Badges';
import { formatDate, getStockStatus } from '../utils/inventoryLogic';
import { useNavigate } from 'react-router-dom';
import StockAdjustModal from '../components/StockAdjustModal';
import MedicineFormModal, { MedicineFormData } from '../components/MedicineFormModal';
import { Medicine } from '../types';

const SCANNER_ELEMENT_ID = 'qr-scanner-region';

export default function QRScanner() {
  const { findByQrCode, adjustStock, addMedicine } = useInventory();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<Medicine | null | 'not-found'>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  function lookup(code: string) {
    const match = findByQrCode(code);
    setResult(match ?? 'not-found');
  }

  async function startScanning() {
    setCameraError(null);
    setScanning(true);
    try {
      const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          lookup(decodedText);
          stopScanning();
        },
        () => {
          // ignore per-frame decode failures — expected while aiming the camera
        },
      );
    } catch (err: any) {
      setScanning(false);
      setCameraError(
        'Camera access failed or is not supported in this browser. Use the manual code entry below instead.',
      );
    }
  }

  function stopScanning() {
    const scanner = scannerRef.current;
    if (scanner) {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    }
    setScanning(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const medicine = result && result !== 'not-found' ? result : null;

  return (
    <div className="flex flex-col gap-5 max-w-xl">
      <div>
        <h1 className="text-xl font-display font-semibold text-ink-900">QR / Barcode Scanner</h1>
        <p className="text-sm text-ink-500">Scan a medicine's code to pull up its inventory record instantly.</p>
      </div>

      <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
        {!scanning ? (
          <button
            onClick={startScanning}
            className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-base-border hover:border-brand-300 hover:bg-brand-50/40 transition-colors focus-ring"
          >
            <Camera size={28} className="text-brand-500" />
            <span className="text-sm font-medium text-ink-700">Tap to open camera scanner</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div id={SCANNER_ELEMENT_ID} className="rounded-xl overflow-hidden bg-black" />
            <button
              onClick={stopScanning}
              className="px-4 py-2 rounded-lg bg-base-bg text-ink-700 text-sm font-medium focus-ring"
            >
              Stop Scanning
            </button>
          </div>
        )}

        {cameraError && <p className="text-sm text-status-danger mt-3">{cameraError}</p>}

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-base-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup(manualCode)}
              placeholder="Or enter QR/Barcode ID manually"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-base-border text-sm focus-ring"
            />
          </div>
          <button
            onClick={() => lookup(manualCode)}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 focus-ring shrink-0"
          >
            Find
          </button>
        </div>
      </div>

      {result === 'not-found' && (
        <div className="bg-white border border-base-border rounded-xl shadow-card p-5 text-center">
          <ScanLine size={28} className="mx-auto text-ink-500 mb-2" />
          <p className="font-medium text-ink-900 mb-1">Medicine not found in inventory.</p>
          <p className="text-sm text-ink-500 mb-4">The scanned code doesn't match any medicine on file.</p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 focus-ring"
          >
            <PlusCircle size={16} /> Add New Medicine
          </button>
        </div>
      )}

      {medicine && (
        <div className="bg-white border border-base-border rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <VialIndicator quantity={medicine.quantity} minStockLevel={medicine.minStockLevel} height={40} />
            <div className="flex-1">
              <p className="font-display font-semibold text-ink-900">{medicine.name}</p>
              <p className="text-xs text-ink-500">Batch {medicine.batchNumber}</p>
            </div>
            <StockBadge status={getStockStatus(medicine)} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <p className="text-xs text-ink-500">Current Quantity</p>
              <p className="font-semibold text-ink-900">{medicine.quantity}</p>
            </div>
            <div>
              <p className="text-xs text-ink-500">Expiry Date</p>
              <p className="font-semibold text-ink-900">{formatDate(medicine.expiryDate)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAdjustOpen(true)}
              className="flex-1 px-4 py-2 rounded-lg bg-brand-50 text-brand-700 text-sm font-medium focus-ring"
            >
              Add / Remove Stock
            </button>
            <button
              onClick={() => navigate(`/inventory/${medicine.id}`)}
              className="flex-1 px-4 py-2 rounded-lg bg-base-bg text-ink-700 text-sm font-medium focus-ring"
            >
              View Full Details
            </button>
          </div>
        </div>
      )}

      <StockAdjustModal
        medicine={adjustOpen ? medicine : null}
        onClose={() => setAdjustOpen(false)}
        onAdjust={(delta) =>
          medicine ? adjustStock(medicine.id, delta, delta > 0 ? 'Stock Added' : 'Stock Removed') : { ok: false }
        }
      />

      <MedicineFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(data: MedicineFormData) => {
          const created = addMedicine({ ...data, qrCodeId: data.qrCodeId || manualCode, isDemo: false } as any);
          setAddOpen(false);
          setResult(created);
        }}
      />
    </div>
  );
}
