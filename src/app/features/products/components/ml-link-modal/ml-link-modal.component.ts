import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, EMPTY } from 'rxjs';
import { MercadolibreService } from '../../../mercadolibre/services/mercadolibre.service';
import { MlItem, MlVariation, ProductVariant, VariantMapping } from '../../../../core/models/product.model';

interface MappingRow {
  mlVariationId: string | null;
  mlLabel: string;
  mlQuantity: number;
  localVariantId: string;
}

export interface MlLinkPayload {
  mlItemId: string;
  variantMappings: VariantMapping[];
}

@Component({
  selector: 'app-ml-link-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ml-link-modal.component.html',
  styleUrl: './ml-link-modal.component.scss',
})
export class MlLinkModalComponent {
  @Input() localVariants: ProductVariant[] = [];
  @Output() confirmed = new EventEmitter<MlLinkPayload>();
  @Output() cancel = new EventEmitter<void>();

  searchQuery = '';
  isSearching = false;
  searchResults: MlItem[] = [];
  searchError = '';
  searched = false;

  selectedItem: MlItem | null = null;
  mappingRows: MappingRow[] = [];

  constructor(private mlService: MercadolibreService) {}

  onSearch(): void {
    if (!this.searchQuery.trim()) return;
    this.isSearching = true;
    this.searchError = '';
    this.searched = false;
    this.selectedItem = null;
    this.mappingRows = [];

    this.mlService.searchItems(this.searchQuery).pipe(
      catchError(() => {
        this.searchError = 'Error al buscar en MercadoLibre. Verifica que la cuenta esté conectada.';
        this.isSearching = false;
        return EMPTY;
      }),
    ).subscribe(items => {
      this.searchResults = items;
      this.isSearching = false;
      this.searched = true;
    });
  }

  onSelectItem(item: MlItem): void {
    this.selectedItem = item;
    this.searchResults = [];

    if (!item.variations?.length) {
      this.mappingRows = [{
        mlVariationId: null,
        mlLabel: 'Producto simple (sin variaciones ML)',
        mlQuantity: item.available_quantity,
        localVariantId: '',
      }];
    } else {
      this.mappingRows = item.variations.map((v: MlVariation) => ({
        mlVariationId: String(v.id),
        mlLabel: v.attribute_combinations.map(a => `${a.name}: ${a.value_name}`).join(' / '),
        mlQuantity: v.available_quantity,
        localVariantId: '',
      }));
    }
  }

  onConfirm(): void {
    if (!this.selectedItem || !this.canConfirm) return;
    this.confirmed.emit({
      mlItemId: this.selectedItem.id,
      variantMappings: this.mappingRows
        .filter(r => r.localVariantId)
        .map(r => ({ localVariantId: r.localVariantId, mlVariationId: r.mlVariationId })),
    });
  }

  get canConfirm(): boolean {
    return !!this.selectedItem && this.mappingRows.some(r => r.localVariantId);
  }
}
