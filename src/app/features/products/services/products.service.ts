import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  Product,
  ProductStatus,
  ProductVariant,
  Tag,
  Paginated,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  SyncToMLRequest,
  LinkToMLRequest,
} from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly CONTEXT = 'ProductsService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getAll(status?: ProductStatus, search?: string): Observable<Product[]> {
    const params: Record<string, string> = {};
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    this.logger.debug(this.CONTEXT, `Loading products — status: ${status ?? 'ALL'}, search: ${search ?? ''}`);
    return this.api.get<{ data: Product[] }>('/products', params).pipe(map(res => res.data));
  }

  getPaginated(page: number, limit: number, status?: ProductStatus, search?: string): Observable<Paginated<Product>> {
    const params: Record<string, string> = { page: page.toString(), limit: limit.toString() };
    if (status) params['status'] = status;
    if (search) params['search'] = search;
    this.logger.debug(this.CONTEXT, `Loading products page ${page} — status: ${status ?? 'ALL'}, search: ${search ?? ''}`);
    return this.api.get<Paginated<Product>>('/products', params);
  }

  getById(id: string): Observable<Product> {
    this.logger.debug(this.CONTEXT, `Loading product ${id}`);
    return this.api.get<Product>(`/products/${id}`);
  }

  create(body: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>('/products', body);
  }

  update(productId: string, body: UpdateProductRequest): Observable<void> {
    return this.api.patch<void>(`/products/${productId}`, body);
  }

  delete(productId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}`);
  }

  addVariant(productId: string, body: CreateVariantRequest): Observable<ProductVariant> {
    return this.api.post<ProductVariant>(`/products/${productId}/variants`, body);
  }

  updateVariant(productId: string, variantId: string, body: UpdateVariantRequest): Observable<void> {
    return this.api.patch<void>(`/products/${productId}/variants/${variantId}`, body);
  }

  deleteVariant(productId: string, variantId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/variants/${variantId}`);
  }

  syncToML(productId: string, body: SyncToMLRequest): Observable<{ mlItemId: string }> {
    this.logger.info(this.CONTEXT, `Syncing product ${productId} to ML`);
    return this.api.post<{ mlItemId: string }>(`/ml/products/${productId}/sync`, body);
  }

  linkToML(productId: string, body: LinkToMLRequest): Observable<void> {
    this.logger.info(this.CONTEXT, `Linking product ${productId} to ML item ${body.mlItemId}`);
    return this.api.post<void>(`/ml/products/${productId}/link`, body);
  }

  linkVariantToML(productId: string, variantId: string, mlVariationId: string): Observable<void> {
    this.logger.info(this.CONTEXT, `Linking variant ${variantId} to ML variation ${mlVariationId}`);
    return this.api.post<void>(`/ml/products/${productId}/variants/${variantId}/link`, { mlVariationId });
  }

  unlinkFromML(productId: string): Observable<void> {
    this.logger.info(this.CONTEXT, `Unlinking product ${productId} from ML`);
    return this.api.delete<void>(`/ml/products/${productId}/link`);
  }

  getTags(): Observable<Tag[]> {
    return this.api.get<Tag[]>('/tags');
  }

  createTag(name: string, color?: string): Observable<Tag> {
    return this.api.post<Tag>('/tags', { name, color });
  }

  deleteTag(tagId: string): Observable<void> {
    return this.api.delete<void>(`/tags/${tagId}`);
  }

  addTag(productId: string, tagId: string): Observable<void> {
    return this.api.post<void>(`/products/${productId}/tags/${tagId}`, {});
  }

  removeTag(productId: string, tagId: string): Observable<void> {
    return this.api.delete<void>(`/products/${productId}/tags/${tagId}`);
  }
}
