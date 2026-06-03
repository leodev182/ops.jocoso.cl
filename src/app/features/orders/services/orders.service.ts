import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

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

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    this.logger.debug(this.CONTEXT, `Updating order ${id} status to ${status}`);
    return this.api.patch<Order>(`/orders/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    this.logger.debug(this.CONTEXT, `Deleting order ${id}`);
    return this.api.delete<void>(`/orders/${id}`);
  }
}
