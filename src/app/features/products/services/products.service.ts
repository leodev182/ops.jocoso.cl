import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  Product,
  ProductStatus,
  ProductVariant,
  CreateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
  SyncToMLRequest,
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

  getById(id: string): Observable<Product> {
    this.logger.debug(this.CONTEXT, `Loading product ${id}`);
    return this.api.get<Product>(`/products/${id}`);
  }

  create(body: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>('/products', body);
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
}
