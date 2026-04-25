import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss',
})
export class OrderDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'OrderDetailPage';

  order: Order | null = null;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordersService
        .getById(id)
        .pipe(
          catchError(err => {
            this.logger.error(this.CONTEXT, `Failed to load order ${id}`, err);
            this.loadError = 'No se pudo cargar la orden.';
            return of(null);
          }),
        )
        .subscribe(o => {
          if (o) this.order = o;
        });
    }
  }

  subtotal(price: string, quantity: number): string {
    return (parseFloat(price) * quantity).toFixed(0);
  }
}
