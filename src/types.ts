export type DosageForm =
  | 'Tablet'
  | 'Capsule'
  | 'Syrup'
  | 'Injection'
  | 'Ointment'
  | 'Drops'
  | 'Inhaler'
  | 'Suspension'
  | 'Cream'
  | 'Other';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type ExpiryStatus = 'Safe' | 'Expiring Soon' | 'Expired';

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  category: string;
  strength: string;
  dosageForm: DosageForm;
  batchNumber: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  expiryDate: string; // ISO date string
  supplier: string;
  storageLocation: string;
  qrCodeId: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'Stock Added' | 'Stock Removed' | 'Manual Adjustment';

export interface StockTransaction {
  id: string;
  medicineId: string;
  medicineName: string;
  previousQuantity: number;
  adjustment: number;
  newQuantity: number;
  type: TransactionType;
  date: string; // ISO date
  time: string; // HH:mm:ss
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AppSettings {
  expiringSoonWindowDays: number; // default 30, used for dashboard + alerts
  currencySymbol: string;
}
