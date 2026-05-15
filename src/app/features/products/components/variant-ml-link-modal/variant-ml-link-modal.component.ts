import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, EMPTY } from 'rxjs';
import { MercadolibreService } from '../../../mercadolibre/services/mercadolibre.service';
import { MlItem, MlVariation } from '../../../../core/models/product.model';

@Component({
  selector: 'app-variant-ml-link-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './variant-ml-link-modal.component.html',
  styleUrl: './variant-ml-link-modal.component.scss',
})
export class VariantMlLinkModalComponent implements OnInit {
  @Input() mlItemId!: string;
  @Input() variantSku!: string;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  isLoading = true;
  error = '';
  variations: MlVariation[] = [];
  selectedVariationId = '';

  constructor(private mlService: MercadolibreService) {}

  ngOnInit(): void {
    this.mlService.getItemDetail(this.mlItemId).pipe(
      catchError(() => {
        this.error = 'No se pudo cargar el item de ML.';
        this.isLoading = false;
        return EMPTY;
      }),
    ).subscribe((item: MlItem) => {
      this.variations = item.variations ?? [];
      this.isLoading = false;
    });
  }

  variationLabel(v: MlVariation): string {
    return v.attribute_combinations.map(a => `${a.name}: ${a.value_name}`).join(' / ');
  }

  onConfirm(): void {
    if (this.selectedVariationId) this.confirmed.emit(this.selectedVariationId);
  }
}
