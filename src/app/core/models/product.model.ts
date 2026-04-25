export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED';

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: string;
  stock: number;
  mlVariationId: string | null;
  attributes: ProductAttribute[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  status: ProductStatus;
  mlItemId: string | null;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

export interface TrendingProduct {
  id: string;
  title: string;
  status: ProductStatus;
  views: number;
  createdAt: string;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
}

export interface CreateVariantRequest {
  sku: string;
  price: number;
  attributes: ProductAttribute[];
}

export interface SyncToMLRequest {
  mlCategoryId: string;
  condition: 'new' | 'used';
  listingType: string;
}
