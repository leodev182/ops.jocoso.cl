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
  images: string[];
  attributes: ProductAttribute[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  status: ProductStatus;
  mlItemId: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

export interface TrendingProduct {
  id: string;
  title: string;
  status: ProductStatus;
  images: string[];
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

export interface UpdateVariantRequest {
  price?: number;
  attributes?: ProductAttribute[];
}

export interface SyncToMLRequest {
  mlCategoryId: string;
  condition: 'new' | 'used';
  listingType: string;
}

export interface MlVariation {
  id: number;
  price: number;
  available_quantity: number;
  attribute_combinations: { id: string; name: string; value_name: string }[];
}

export interface MlItem {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  thumbnail: string;
  variations: MlVariation[];
}

export interface VariantMapping {
  localVariantId: string;
  mlVariationId: string | null;
}

export interface LinkToMLRequest {
  mlItemId: string;
  variantMappings: VariantMapping[];
}
