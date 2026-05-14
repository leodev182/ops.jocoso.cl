import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { ProductsService } from '../../../products/services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-stock-overview-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './stock-overview-page.component.html',
  styleUrl: './stock-overview-page.component.scss',
})
export class StockOverviewPageComponent implements OnInit {
  private readonly CONTEXT = 'StockOverviewPage';
  private search$ = new Subject<string>();

  searchTerm = '';
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private logger: LoggerService,
  ) {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isLoading = true;
        this.errorMessage = '';
        return this.productsService.getAll(undefined, term || undefined).pipe(
          catchError(err => {
            this.logger.error(this.CONTEXT, 'Search failed', err);
            this.errorMessage = 'Error al buscar productos.';
            return of([]);
          }),
        );
      }),
    ).subscribe(res => {
      this.isLoading = false;
      this.products = res;
    });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  onSearchChange(): void {
    this.search$.next(this.searchTerm);
  }

  goToVariantStock(variantId: string): void {
    this.router.navigate(['/stock', variantId]);
  }

  private loadAll(): void {
    this.isLoading = true;
    this.productsService.getAll().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load products', err);
        this.errorMessage = 'Error al cargar productos.';
        return of([]);
      }),
    ).subscribe(res => {
      this.isLoading = false;
      this.products = res;
    });
  }
}
