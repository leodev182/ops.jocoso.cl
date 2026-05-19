import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
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
export class StockOverviewPageComponent implements OnInit, OnDestroy {
  private readonly CONTEXT = 'StockOverviewPage';
  private readonly PAGE_SIZE = 6;
  private search$ = new Subject<string>();
  private sub = new Subscription();

  searchTerm = '';
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  totalPages = 1;
  total = 0;

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.search$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => {
          this.currentPage = 1;
          return this.loadPage(1, term);
        }),
      ).subscribe(res => {
        this.products = res.data;
        this.totalPages = res.totalPages;
        this.total = res.total;
        this.isLoading = false;
      }),
    );

    this.load(1);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearchChange(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.search$.next(this.searchTerm);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.load(page);
  }

  goToVariantStock(variantId: string): void {
    this.router.navigate(['/stock', variantId]);
  }

  private load(page: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loadPage(page, this.searchTerm).subscribe(res => {
      this.products = res.data;
      this.currentPage = res.page;
      this.totalPages = res.totalPages;
      this.total = res.total;
      this.isLoading = false;
    });
  }

  private loadPage(page: number, search: string) {
    return this.productsService
      .getPaginated(page, this.PAGE_SIZE, undefined, search || undefined)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to load products', err);
          this.errorMessage = 'Error al cargar productos.';
          this.isLoading = false;
          return of({ data: [], total: 0, page: 1, limit: this.PAGE_SIZE, totalPages: 1 });
        }),
      );
  }
}
