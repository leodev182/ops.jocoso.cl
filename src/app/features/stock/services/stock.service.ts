import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { StockLevel, StockMovement, StockAdjustRequest } from '../../../core/models/stock.model';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly CONTEXT = 'StockService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getLevel(variantId: string): Observable<StockLevel> {
    this.logger.debug(this.CONTEXT, `Loading stock level for ${variantId}`);
    return this.api.get<StockLevel>(`/stock/${variantId}`);
  }

  getMovements(variantId: string, limit = 50): Observable<StockMovement[]> {
    return this.api.get<StockMovement[]>(`/stock/${variantId}/movements`, {
      limit: String(limit),
    });
  }

  increase(body: StockAdjustRequest): Observable<void> {
    this.logger.info(this.CONTEXT, `Increasing stock for ${body.variantId} by ${body.quantity}`);
    return this.api.post<void>('/stock/increase', body);
  }

  decrease(body: StockAdjustRequest): Observable<void> {
    this.logger.info(this.CONTEXT, `Decreasing stock for ${body.variantId} by ${body.quantity}`);
    return this.api.post<void>('/stock/decrease', body);
  }
}
