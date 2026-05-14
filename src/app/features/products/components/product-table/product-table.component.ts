import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Product } from '../../../../core/models/product.model';

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
}
