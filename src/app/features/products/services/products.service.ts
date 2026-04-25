import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  Product,
  ProductStatus,
  ProductVariant,
  CreateProductRequest,
  CreateVariantRequest,
  SyncToMLRequest,
} from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly CONTEXT = 'ProductsService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getAll(status?: ProductStatus): Observable<Product[]> {
    const params = status ? { status } : undefined;
    this.logger.debug(this.CONTEXT, `Loading products — status: ${status ?? 'ALL'}`);
    return this.api.get<Product[]>('/products', params);
  }

  getById(id: string): Observable<Product> {
    this.logger.debug(this.CONTEXT, `Loading product ${id}`);
    return this.api.get<Product>(`/products/${id}`);
  }

  create(body: CreateProductRequest): Observable<Product> {
    return this.api.post<Product>('/products', body);
  }

  addVariant(productId: string, body: CreateVariantRequest): Observable<ProductVariant> {
    return this.api.post<ProductVariant>(`/products/${productId}/variants`, body);
  }

  syncToML(productId: string, body: SyncToMLRequest): Observable<{ mlItemId: string }> {
    this.logger.info(this.CONTEXT, `Syncing product ${productId} to ML`);
    return this.api.post<{ mlItemId: string }>(`/ml/products/${productId}/sync`, body);
  }
}
