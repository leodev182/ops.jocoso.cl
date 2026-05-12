export interface LowStockVariant {
  variantId: string;
  sku: string;
  stock: number;
  productTitle: string;
}

export interface AdminStats {
  orders: {
    total: number;
    byStatus: Partial<Record<string, number>>;
    revenueLast30Days: number;
  };
  payments: {
    approved: number;
    rejected: number;
    pending: number;
    settled: number;
  };
  stock: {
    lowStock: LowStockVariant[];
  };
  products: {
    total: number;
    active: number;
  };
}
