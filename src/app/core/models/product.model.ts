export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  slug: string | null;
  description: string;
  brand: string | null;
  status: ProductStatus;
  featured: boolean;
  mlItemId: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  tags?: Tag[];
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

export interface UpdateProductRequest {
  title?: string;
  slug?: string;
  description?: string;
  brand?: string;
  status?: ProductStatus;
  featured?: boolean;
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
