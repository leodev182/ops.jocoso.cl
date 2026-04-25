import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { StockService } from '../../services/stock.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { StockLevel, StockMovement, StockAdjustRequest } from '../../../../core/models/stock.model';
import { MovementsTableComponent } from '../../components/movements-table/movements-table.component';

@Component({
  selector: 'app-stock-page',
  standalone: true,
  imports: [ReactiveFormsModule, MovementsTableComponent],
  templateUrl: './stock-page.component.html',
  styleUrl: './stock-page.component.scss',
})
export class StockPageComponent implements OnInit {
  private readonly CONTEXT = 'StockPage';

  variantId = '';
  stockLevel: StockLevel | null = null;
  movements: StockMovement[] = [];
  showAdjustForm = false;
  adjustType: 'increase' | 'decrease' = 'increase';
  isAdjusting = false;
  errorMessage = '';
  successMessage = '';

  adjustForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    private fb: FormBuilder,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.adjustForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      referenceType: ['MANUAL', Validators.required],
      referenceId: ['', Validators.required],
    });

    this.variantId = this.route.snapshot.paramMap.get('variantId') ?? '';
    if (this.variantId) {
      this.loadData();
    }
  }

  openAdjustForm(type: 'increase' | 'decrease'): void {
    this.adjustType = type;
    this.showAdjustForm = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  onAdjust(): void {
    if (this.adjustForm.invalid) return;
    this.isAdjusting = true;

    const body: StockAdjustRequest = {
      variantId: this.variantId,
      source: 'ADMIN',
      ...this.adjustForm.value,
    };

    const action$ =
      this.adjustType === 'increase'
        ? this.stockService.increase(body)
        : this.stockService.decrease(body);

    action$
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Stock adjustment failed', err);
          this.errorMessage = 'Error al ajustar el stock.';
          this.isAdjusting = false;
          return of(null);
        }),
      )
      .subscribe(res => {
        if (res !== null) {
          this.successMessage = `Stock ${this.adjustType === 'increase' ? 'aumentado' : 'disminuido'} correctamente.`;
          this.showAdjustForm = false;
          this.adjustForm.reset({ quantity: 1, referenceType: 'MANUAL', referenceId: '' });
          this.loadData();
        }
        this.isAdjusting = false;
      });
  }

  private loadData(): void {
    this.stockService
      .getLevel(this.variantId)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to load stock level', err);
          return of(null);
        }),
      )
      .subscribe(level => {
        if (level) this.stockLevel = level;
      });

    this.stockService
      .getMovements(this.variantId)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to load movements', err);
          return of([]);
        }),
      )
      .subscribe(m => (this.movements = m));
  }
}
