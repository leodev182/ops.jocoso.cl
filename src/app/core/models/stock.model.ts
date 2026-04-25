export type StockSource = 'WEB' | 'ML' | 'ADMIN';
export type StockReferenceType = 'ORDER' | 'ML_SALE' | 'MANUAL';

export interface StockLevel {
  variantId: string;
  stock: number;
}

export interface StockMovement {
  id: string;
  variantId: string;
  quantity: number;
  source: StockSource;
  referenceType: StockReferenceType;
  referenceId: string | null;
  externalId: string | null;
  createdAt: string;
}

export interface StockAdjustRequest {
  variantId: string;
  quantity: number;
  source: StockSource;
  referenceType: StockReferenceType;
  referenceId: string;
}
