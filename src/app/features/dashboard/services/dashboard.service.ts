import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { TrendingProduct } from '../../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly CONTEXT = 'DashboardService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getTrending(period: '7d' | '30d' | '90d' = '7d', limit = 10): Observable<TrendingProduct[]> {
    this.logger.debug(this.CONTEXT, `Loading trending — period: ${period}, limit: ${limit}`);
    return this.api.get<TrendingProduct[]>('/products/trending', {
      period,
      limit: String(limit),
    });
  }
}
