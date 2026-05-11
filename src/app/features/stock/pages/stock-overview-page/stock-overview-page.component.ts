import { Component } from '@angular/core';
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
export class StockOverviewPageComponent {
  private readonly CONTEXT = 'StockOverviewPage';
  private search$ = new Subject<string>();

  searchTerm = '';
  products: Product[] = [];
  searched = false;
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
        if (!term.trim()) {
          this.products = [];
          this.searched = false;
          return of(null);
        }
        this.isLoading = true;
        this.errorMessage = '';
        return this.productsService.getAll(undefined, term).pipe(
          catchError(err => {
            this.logger.error(this.CONTEXT, 'Search failed', err);
            this.errorMessage = 'Error al buscar productos.';
            return of(null);
          }),
        );
      }),
    ).subscribe(res => {
      this.isLoading = false;
      if (res) {
        this.products = res;
        this.searched = true;
      }
    });
  }

  onSearchChange(): void {
    this.search$.next(this.searchTerm);
  }

  goToVariantStock(variantId: string): void {
    this.router.navigate(['/stock', variantId]);
  }
}
