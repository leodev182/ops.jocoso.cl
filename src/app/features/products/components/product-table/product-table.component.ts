import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Product, ProductStatus } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss',
})
export class ProductTableComponent {
  @Input() products: Product[] = [];
  @Output() productClick = new EventEmitter<Product>();
  @Output() statusChange = new EventEmitter<{ product: Product; status: ProductStatus }>();

  toggleStatus(product: Product, event: Event): void {
    event.stopPropagation();
    if (product.status === 'INACTIVE') return;
    const next: ProductStatus = product.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    this.statusChange.emit({ product, status: next });
  }
}
