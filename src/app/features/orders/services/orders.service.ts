import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  // Backend needs GET /orders (admin) — currently only GET /orders/my exists for customers
  getAll(): Observable<Order[]> {
    this.logger.debug(this.CONTEXT, 'Loading all orders');
    return this.api.get<Order[]>('/orders');
  }

  getById(id: string): Observable<Order> {
    this.logger.debug(this.CONTEXT, `Loading order ${id}`);
    return this.api.get<Order>(`/orders/${id}`);
  }
}
