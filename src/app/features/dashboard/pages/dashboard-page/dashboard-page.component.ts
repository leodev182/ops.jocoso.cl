import { Component, OnInit } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { catchError, of } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { TrendingProduct } from '../../../../core/models/product.model';
import { AdminStats } from '../../../../core/models/stats.model';
import { TrendingTableComponent } from '../../components/trending-table/trending-table.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [TrendingTableComponent, AsyncPipe, DecimalPipe],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private readonly CONTEXT = 'DashboardPage';

  readonly periods: Array<'7d' | '30d' | '90d'> = ['7d', '30d', '90d'];
  selectedPeriod: '7d' | '30d' | '90d' = '7d';
  trending$!: Observable<TrendingProduct[]>;
  stats$!: Observable<AdminStats | null>;
  loadError = '';

  constructor(
    private dashboardService: DashboardService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.loadTrending();
    this.loadStats();
  }

  onPeriodChange(period: '7d' | '30d' | '90d'): void {
    this.selectedPeriod = period;
    this.loadTrending();
  }

  private loadTrending(): void {
    this.loadError = '';
    this.trending$ = this.dashboardService.getTrending(this.selectedPeriod).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load trending products', err);
        this.loadError = 'No se pudieron cargar los datos.';
        return of([]);
      }),
    );
  }

  private loadStats(): void {
    this.stats$ = this.dashboardService.getStats().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load stats', err);
        return of(null);
      }),
    );
  }
}
