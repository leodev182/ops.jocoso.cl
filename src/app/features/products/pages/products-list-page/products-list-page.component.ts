import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, switchMap, catchError, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product, ProductStatus } from '../../../../core/models/product.model';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [ProductTableComponent, AsyncPipe],
  templateUrl: './products-list-page.component.html',
  styleUrl: './products-list-page.component.scss',
})
export class ProductsListPageComponent implements OnInit {
  private readonly CONTEXT = 'ProductsListPage';

  readonly statusOptions: Array<{ label: string; value: ProductStatus | undefined }> = [
    { label: 'Todos', value: undefined },
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' },
    { label: 'PAUSED', value: 'PAUSED' },
  ];

  private statusFilter$ = new BehaviorSubject<ProductStatus | undefined>(undefined);
  products$!: Observable<Product[]>;
  selectedStatus: ProductStatus | undefined;
  loadError = '';

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.products$ = this.statusFilter$.pipe(
      switchMap(status =>
        this.productsService.getAll(status).pipe(
          catchError(err => {
            this.logger.error(this.CONTEXT, 'Failed to load products', err);
            this.loadError = 'No se pudieron cargar los productos.';
            return of([]);
          }),
        ),
      ),
    );
  }

  onStatusChange(status: ProductStatus | undefined): void {
    this.selectedStatus = status;
    this.loadError = '';
    this.statusFilter$.next(status);
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/new']);
  }
}
