import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss',
})
export class OrderDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'OrderDetailPage';

  order: Order | null = null;
  loadError = '';
  isGeneratingLabel = false;
  labelError = '';
  zpl = '';
  trackingCode = '';

  constructor(
    private route: ActivatedRoute,
    private ordersService: OrdersService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.ordersService.getById(id).pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, `Failed to load order ${id}`, err);
          this.loadError = 'No se pudo cargar la orden.';
          return of(null);
        }),
      ).subscribe(o => {
        if (o) {
          this.order = o;
          this.zpl = o.shippingLabel ?? '';
          this.trackingCode = o.trackingCode ?? '';
        }
      });
    }
  }

  onGenerateLabel(): void {
    if (!this.order) return;
    this.isGeneratingLabel = true;
    this.labelError = '';

    this.ordersService.generateShippingLabel(this.order.id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to generate label', err);
        this.labelError = err?.error?.message ?? 'Error al generar la etiqueta.';
        this.isGeneratingLabel = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res) {
        this.zpl = res.zpl;
        this.trackingCode = res.trackingCode;
        this.order = { ...this.order!, trackingCode: res.trackingCode, shippingLabel: res.zpl };
      }
      this.isGeneratingLabel = false;
    });
  }

  onDownloadZpl(): void {
    const blob = new Blob([this.zpl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-${this.order?.id?.slice(0, 8)}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
  }

  subtotal(price: string, quantity: number): string {
    return (parseFloat(price) * quantity).toFixed(0);
  }
}
