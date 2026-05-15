import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';

interface StatusFilter {
  label: string;
  value: OrderStatus | 'ALL';
}

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [OrdersTableComponent],
  templateUrl: './orders-list-page.component.html',
  styleUrl: './orders-list-page.component.scss',
})
export class OrdersListPageComponent implements OnInit {
  private readonly CONTEXT = 'OrdersListPage';

  allOrders: Order[] = [];
  loadError = '';
  selectedStatus: OrderStatus | 'ALL' = 'ALL';

  readonly filters: StatusFilter[] = [
    { label: 'Todos',              value: 'ALL'       },
    { label: 'Pendiente de Pago',  value: 'PENDING'   },
    { label: 'Pago Confirmado',    value: 'CONFIRMED' },
    { label: 'En Camino',          value: 'SHIPPED'   },
    { label: 'Entregado',          value: 'COMPLETED' },
    { label: 'Cancelado',          value: 'CANCELLED' },
  ];

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.ordersService.getAll().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load orders', err);
        this.loadError = 'No se pudieron cargar las órdenes.';
        return of([]);
      }),
    ).subscribe(orders => { this.allOrders = orders; });
  }

  get filteredOrders(): Order[] {
    if (this.selectedStatus === 'ALL') return this.allOrders;
    return this.allOrders.filter(o => o.status === this.selectedStatus);
  }

  countFor(status: OrderStatus | 'ALL'): number {
    if (status === 'ALL') return this.allOrders.length;
    return this.allOrders.filter(o => o.status === status).length;
  }

  onOrderClick(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }
}
