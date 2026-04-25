import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, catchError, of } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Order } from '../../../../core/models/order.model';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [OrdersTableComponent, AsyncPipe],
  templateUrl: './orders-list-page.component.html',
  styleUrl: './orders-list-page.component.scss',
})
export class OrdersListPageComponent implements OnInit {
  private readonly CONTEXT = 'OrdersListPage';

  orders$!: Observable<Order[]>;
  loadError = '';

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.orders$ = this.ordersService.getAll().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load orders', err);
        this.loadError = 'No se pudieron cargar las órdenes.';
        return of([]);
      }),
    );
  }

  onOrderClick(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }
}
