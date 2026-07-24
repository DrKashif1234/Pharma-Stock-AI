import { ExpiryStatus, Medicine, StockStatus } from '../types';

export function getStockStatus(medicine: Pick<Medicine, 'quantity' | 'minStockLevel'>): StockStatus {
  if (medicine.quantity <= 0) return 'Out of Stock';
  if (medicine.quantity <= medicine.minStockLevel) return 'Low Stock';
  return 'In Stock';
}

export function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(expiryDate: string, expiringSoonWindowDays = 30): ExpiryStatus {
  const diff = daysUntil(expiryDate);
  if (diff < 0) return 'Expired';
  if (diff <= expiringSoonWindowDays) return 'Expiring Soon';
  return 'Safe';
}

export type ExpiryBucket = 'Expired' | 'Within 30 Days' | 'Within 60 Days' | 'Within 90 Days' | 'Safe';

export function getExpiryBucket(expiryDate: string): ExpiryBucket {
  const diff = daysUntil(expiryDate);
  if (diff < 0) return 'Expired';
  if (diff <= 30) return 'Within 30 Days';
  if (diff <= 60) return 'Within 60 Days';
  if (diff <= 90) return 'Within 90 Days';
  return 'Safe';
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateIso: string, time?: string): string {
  const base = formatDate(dateIso);
  return time ? `${base} · ${time}` : base;
}

export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}
