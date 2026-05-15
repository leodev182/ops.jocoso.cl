import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product, CreateProductRequest, CreateVariantRequest, ProductVariant } from '../../../../core/models/product.model';
import { VariantFormComponent } from '../../components/variant-form/variant-form.component';
import { MlLinkModalComponent, MlLinkPayload } from '../../components/ml-link-modal/ml-link-modal.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [ReactiveFormsModule, VariantFormComponent, MlLinkModalComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.scss',
})
export class ProductDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'ProductDetailPage';

  product: Product | null = null;
  isNew = false;
  isSaving = false;
  isDeleting = false;
  isSyncing = false;
  errorMessage = '';
  successMessage = '';
  syncMessage = '';
  syncError = false;
  showVariantForm = false;
  showMlLinkModal = false;
  editingVariant: ProductVariant | null = null;

  productForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private fb: FormBuilder,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) {
      this.loadProduct(id);
    }
  }

  onSaveProduct(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';

    const body: CreateProductRequest = this.productForm.value;
    this.productsService.create(body).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to create product', err);
        this.errorMessage = 'Error al guardar el producto.';
        this.isSaving = false;
        return of(null);
      }),
    ).subscribe(p => {
      if (p) {
        this.product = p;
        this.isNew = false;
        this.isSaving = false;
        this.successMessage = 'Producto creado.';
      }
    });
  }

  onDeleteProduct(): void {
    if (!this.product) return;
    if (!confirm(`¿Eliminar el producto "${this.product.title}"? Esta acción no se puede deshacer.`)) return;

    this.isDeleting = true;
    this.productsService.delete(this.product.id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to delete product', err);
        this.errorMessage = 'Error al eliminar el producto.';
        this.isDeleting = false;
        return of(null);
      }),
    ).subscribe(() => {
      this.router.navigate(['/products']);
    });
  }

  openAddVariant(): void {
    this.editingVariant = null;
    this.showVariantForm = true;
  }

  openEditVariant(variant: ProductVariant): void {
    this.editingVariant = variant;
    this.showVariantForm = true;
  }

  onVariantSubmit(body: CreateVariantRequest): void {
    if (!this.product) return;

    if (this.editingVariant) {
      this.productsService.updateVariant(this.product.id, this.editingVariant.id, body).pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to update variant', err);
          this.errorMessage = 'Error al actualizar la variante.';
          return of(null);
        }),
      ).subscribe(res => {
        if (res !== null) {
          this.loadProduct(this.product!.id);
          this.showVariantForm = false;
          this.editingVariant = null;
          this.successMessage = 'Variante actualizada.';
        }
      });
    } else {
      this.productsService.addVariant(this.product.id, body).pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to add variant', err);
          this.errorMessage = 'Error al agregar la variante.';
          return of(null);
        }),
      ).subscribe(variant => {
        if (variant) {
          this.loadProduct(this.product!.id);
          this.showVariantForm = false;
          this.successMessage = 'Variante creada.';
        }
      });
    }
  }

  onDeleteVariant(variant: ProductVariant): void {
    if (!this.product) return;
    if (!confirm(`¿Eliminar la variante "${variant.sku}"?`)) return;

    this.productsService.deleteVariant(this.product.id, variant.id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to delete variant', err);
        this.errorMessage = 'Error al eliminar la variante.';
        return of(null);
      }),
    ).subscribe(() => {
      this.product = {
        ...this.product!,
        variants: this.product!.variants?.filter(v => v.id !== variant.id) ?? [],
      };
      this.successMessage = 'Variante eliminada.';
    });
  }

  onMlLinkConfirmed(payload: MlLinkPayload): void {
    if (!this.product) return;
    this.isSyncing = true;
    this.syncMessage = '';
    this.syncError = false;
    this.showMlLinkModal = false;

    this.productsService.linkToML(this.product.id, payload).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'ML link failed', err);
        this.syncMessage = 'Error al vincular con MercadoLibre.';
        this.syncError = true;
        this.isSyncing = false;
        return EMPTY;
      }),
    ).subscribe(() => {
      this.loadProduct(this.product!.id);
      this.syncMessage = `Vinculado correctamente con ${payload.mlItemId}`;
      this.isSyncing = false;
    });
  }

  onSyncToML(): void {
    if (!this.product) return;
    this.isSyncing = true;
    this.syncMessage = '';

    this.productsService.syncToML(this.product.id, {
      mlCategoryId: 'MLC1055',
      condition: 'new',
      listingType: 'gold_special',
    }).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'ML sync failed', err);
        this.syncMessage = 'Error al sincronizar con MercadoLibre.';
        this.isSyncing = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res) {
        this.product = { ...this.product!, mlItemId: res.mlItemId };
        this.syncMessage = `Publicado en ML: ${res.mlItemId}`;
      }
      this.isSyncing = false;
    });
  }

  private loadProduct(id: string): void {
    this.productsService.getById(id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, `Failed to load product ${id}`, err);
        this.errorMessage = 'No se pudo cargar el producto.';
        return of(null);
      }),
    ).subscribe(p => {
      if (p) {
        this.product = p;
        this.productForm.patchValue({ title: p.title, description: p.description });
      }
    });
  }
}
