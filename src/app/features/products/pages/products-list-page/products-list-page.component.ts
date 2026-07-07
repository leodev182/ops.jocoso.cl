import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, of, tap } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product, ProductStatus } from '../../../../core/models/product.model';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

@Component({
  selector: 'app-products-list-page',
  standalone: true,
  imports: [ProductTableComponent],
  templateUrl: './products-list-page.component.html',
  styleUrl: './products-list-page.component.scss',
})
export class ProductsListPageComponent implements OnInit {
  private readonly CONTEXT = 'ProductsListPage';
  private readonly PAGE_SIZE = 10;

  readonly statusOptions: Array<{ label: string; value: ProductStatus | undefined }> = [
    { label: 'Todos', value: undefined },
    { label: 'ACTIVE', value: 'ACTIVE' },
    { label: 'INACTIVE', value: 'INACTIVE' },
    { label: 'PAUSED', value: 'PAUSED' },
  ];

  selectedStatus: ProductStatus | undefined;
  products: Product[] = [];
  isLoading = false;
  loadError = '';
  currentPage = 1;
  totalPages = 1;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.load(1);
  }

  onStatusChange(status: ProductStatus | undefined): void {
    this.selectedStatus = status;
    this.loadError = '';
    this.load(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.load(page);
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }

  onCreateProduct(): void {
    this.router.navigate(['/products/new']);
  }

  onProductStatusChange({ product, status }: { product: Product; status: ProductStatus }): void {
    this.productsService.update(product.id, { status }).pipe(
      tap(() => {
        this.products = this.products.map(p => p.id === product.id ? { ...p, status } : p);
      }),
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to update product status', err);
        return EMPTY;
      }),
    ).subscribe();
  }

  private load(page: number): void {
    this.isLoading = true;
    this.productsService
      .getPaginated(page, this.PAGE_SIZE, this.selectedStatus)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to load products', err);
          this.loadError = 'No se pudieron cargar los productos.';
          this.isLoading = false;
          return of({ data: [], total: 0, page: 1, limit: this.PAGE_SIZE, totalPages: 1 });
        }),
      )
      .subscribe(res => {
        this.products = res.data;
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      });
  }
}
