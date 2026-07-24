import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, Medicine, StockTransaction, TransactionType } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';
import { buildSampleMedicines } from '../data/sampleData';
import { generateId, nowIso } from '../utils/inventoryLogic';

const DEFAULT_SETTINGS: AppSettings = {
  expiringSoonWindowDays: 30,
  currencySymbol: '$',
};

interface InventoryContextValue {
  medicines: Medicine[];
  transactions: StockTransaction[];
  settings: AppSettings;
  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => Medicine;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  adjustStock: (id: string, delta: number, type: TransactionType) => { ok: boolean; error?: string };
  updateSettings: (data: Partial<AppSettings>) => void;
  clearDemoData: () => void;
  findByQrCode: (code: string) => Medicine | undefined;
}

const InventoryContext = createContext<InventoryContextValue | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const stored = loadFromStorage<Medicine[] | null>(STORAGE_KEYS.medicines, null);
    if (stored && stored.length > 0) return stored;
    return buildSampleMedicines();
  });

  const [transactions, setTransactions] = useState<StockTransaction[]>(() =>
    loadFromStorage<StockTransaction[]>(STORAGE_KEYS.transactions, []),
  );

  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage<AppSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  );

  useEffect(() => saveToStorage(STORAGE_KEYS.medicines, medicines), [medicines]);
  useEffect(() => saveToStorage(STORAGE_KEYS.transactions, transactions), [transactions]);
  useEffect(() => saveToStorage(STORAGE_KEYS.settings, settings), [settings]);

  const addMedicine = useCallback((data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const ts = nowIso();
    const medicine: Medicine = { ...data, id: generateId('med'), createdAt: ts, updatedAt: ts };
    setMedicines((prev) => [medicine, ...prev]);
    return medicine;
  }, []);

  const updateMedicine = useCallback((id: string, data: Partial<Medicine>) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data, updatedAt: nowIso() } : m)),
    );
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const adjustStock = useCallback(
    (id: string, delta: number, type: TransactionType) => {
      let result: { ok: boolean; error?: string } = { ok: true };
      setMedicines((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const newQuantity = m.quantity + delta;
          if (newQuantity < 0) {
            result = { ok: false, error: 'Cannot remove more stock than is currently available.' };
            return m;
          }
          const now = new Date();
          const transaction: StockTransaction = {
            id: generateId('txn'),
            medicineId: m.id,
            medicineName: m.name,
            previousQuantity: m.quantity,
            adjustment: delta,
            newQuantity,
            type,
            date: now.toISOString().slice(0, 10),
            time: now.toTimeString().slice(0, 8),
          };
          setTransactions((prevTxns) => [transaction, ...prevTxns]);
          return { ...m, quantity: newQuantity, updatedAt: nowIso() };
        }),
      );
      return result;
    },
    [],
  );

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  const clearDemoData = useCallback(() => {
    setMedicines((prev) => prev.filter((m) => !m.isDemo));
  }, []);

  const findByQrCode = useCallback(
    (code: string) => medicines.find((m) => m.qrCodeId.toLowerCase() === code.toLowerCase().trim()),
    [medicines],
  );

  const value = useMemo(
    () => ({
      medicines,
      transactions,
      settings,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      adjustStock,
      updateSettings,
      clearDemoData,
      findByQrCode,
    }),
    [medicines, transactions, settings, addMedicine, updateMedicine, deleteMedicine, adjustStock, updateSettings, clearDemoData, findByQrCode],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within an InventoryProvider');
  return ctx;
}
