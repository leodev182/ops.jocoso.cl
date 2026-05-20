import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Order } from '../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly CONTEXT = 'OrdersService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getAll(): Observable<Order[]> {
    this.logger.debug(this.CONTEXT, 'Loading all orders');
    return this.api.get<{ data: Order[] }>('/orders').pipe(map(res => res.data));
  }

  getById(id: string): Observable<Order> {
    this.logger.debug(this.CONTEXT, `Loading order ${id}`);
    return this.api.get<Order>(`/orders/${id}`);
  }

  generateShippingLabel(id: string): Observable<{ trackingCode: string; zpl: string }> {
    return this.api.post<{ trackingCode: string; zpl: string }>(`/orders/${id}/shipping-label`, {});
  }
}
