import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { MlItem } from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class MercadolibreService {
  private readonly CONTEXT = 'MercadolibreService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getItemDetail(mlItemId: string): Observable<MlItem> {
    return this.api.get<MlItem>(`/ml/items/${mlItemId}`);
  }

  searchItems(search: string): Observable<MlItem[]> {
    this.logger.info(this.CONTEXT, `Searching ML items: "${search}"`);
    return this.api.get<{ items: MlItem[] }>('/ml/items', { search }).pipe(map(res => res.items));
  }

  redirectToAuthorize(): void {
    this.logger.info(this.CONTEXT, 'Fetching ML OAuth URL');
    this.api.get<{ url: string }>('/ml/oauth/authorize').subscribe({
      next: ({ url }) => {
        window.location.href = url;
      },
      error: err => {
        this.logger.error(this.CONTEXT, 'Failed to get ML OAuth URL', err);
      },
    });
  }
}
