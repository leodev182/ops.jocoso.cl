import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product, Tag, CreateProductRequest, UpdateProductRequest, CreateVariantRequest, ProductVariant } from '../../../../core/models/product.model';
import { VariantFormComponent } from '../../components/variant-form/variant-form.component';
import { MlLinkModalComponent, MlLinkPayload } from '../../components/ml-link-modal/ml-link-modal.component';
import { VariantMlLinkModalComponent } from '../../components/variant-ml-link-modal/variant-ml-link-modal.component';

function toSlug(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, VariantFormComponent, MlLinkModalComponent, VariantMlLinkModalComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.scss',
})
export class ProductDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'ProductDetailPage';
  private slugManuallyEdited = false;

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
  linkingVariant: ProductVariant | null = null;
  editingVariant: ProductVariant | null = null;

  allTags: Tag[] = [];
  selectedTagId = '';

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
      slug: [''],
      description: [''],
      brand: [''],
      featured: [false],
    });

    this.productsService.getTags().pipe(
      catchError(() => of([])),
    ).subscribe(tags => this.allTags = tags);

    const id = this.route.snapshot.paramMap.get('id');
    if (id === 'new') {
      this.isNew = true;
    } else if (id) {
      this.loadProduct(id);
    }
  }

  onTitleChange(): void {
    if (!this.slugManuallyEdited) {
      const title = this.productForm.get('title')?.value ?? '';
      this.productForm.patchValue({ slug: toSlug(title) }, { emitEvent: false });
    }
  }

  onSlugChange(): void {
    this.slugManuallyEdited = true;
  }

  get availableTags(): Tag[] {
    const current = new Set((this.product?.tags ?? []).map(t => t.id));
    return this.allTags.filter(t => !current.has(t.id));
  }

  onAddTag(): void {
    if (!this.selectedTagId || !this.product) return;
    this.productsService.addTag(this.product.id, this.selectedTagId).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to add tag', err);
        this.errorMessage = 'Error al agregar el tag.';
        return EMPTY;
      }),
    ).subscribe(() => {
      const tag = this.allTags.find(t => t.id === this.selectedTagId);
      if (tag) {
        this.product = { ...this.product!, tags: [...(this.product!.tags ?? []), tag] };
      }
      this.selectedTagId = '';
    });
  }

  onRemoveTag(tag: Tag): void {
    if (!this.product) return;
    this.productsService.removeTag(this.product.id, tag.id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to remove tag', err);
        this.errorMessage = 'Error al quitar el tag.';
        return EMPTY;
      }),
    ).subscribe(() => {
      this.product = { ...this.product!, tags: this.product!.tags?.filter(t => t.id !== tag.id) ?? [] };
    });
  }

  onSaveProduct(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isNew) {
      const body: CreateProductRequest = {
        title: this.productForm.value.title,
        description: this.productForm.value.description,
      };
      this.productsService.create(body).pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to create product', err);
          this.errorMessage = 'Error al crear el producto.';
          this.isSaving = false;
          return of(null);
        }),
      ).subscribe(p => {
        if (p) {
          this.isSaving = false;
          this.router.navigate(['/products', p.id]);
        }
      });
    } else {
      const body: UpdateProductRequest = {
        title: this.productForm.value.title,
        slug: this.productForm.value.slug || undefined,
        description: this.productForm.value.description,
        brand: this.productForm.value.brand || undefined,
        featured: this.productForm.value.featured,
      };
      this.productsService.update(this.product!.id, body).pipe(
        tap(() => {
          this.product = { ...this.product!, ...body };
          this.successMessage = 'Producto actualizado.';
          setTimeout(() => this.successMessage = '', 3000);
        }),
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to update product', err);
          this.errorMessage = 'Error al actualizar el producto.';
          return EMPTY;
        }),
        finalize(() => this.isSaving = false),
      ).subscribe();
    }
  }

  onCloneProduct(): void {
    if (!this.product) return;
    if (!confirm(`¿Clonar "${this.product.title}"? Se creará como nuevo producto sin variantes ni vínculo ML.`)) return;

    const body: CreateProductRequest = {
      title: `${this.product.title} (copia)`,
      description: this.product.description ?? undefined,
    };
    this.productsService.create(body).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to clone product', err);
        this.errorMessage = 'Error al clonar el producto.';
        return of(null);
      }),
    ).subscribe(p => {
      if (p) this.router.navigate(['/products', p.id]);
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

  get firstVariant(): ProductVariant | null {
    return this.product?.variants?.[0] ?? null;
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

  onLinkVariantToML(variant: ProductVariant, mlVariationId: string): void {
    if (!this.product) return;
    this.linkingVariant = null;

    this.productsService.linkVariantToML(this.product.id, variant.id, mlVariationId).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Variant ML link failed', err);
        this.errorMessage = 'Error al vincular la variante con ML.';
        return EMPTY;
      }),
    ).subscribe(() => {
      this.loadProduct(this.product!.id);
      this.successMessage = `Variante ${variant.sku} vinculada a ML.`;
    });
  }

  onUnlinkFromML(): void {
    if (!this.product?.mlItemId) return;
    if (!confirm(`¿Desvincular este producto de ${this.product.mlItemId}? El stock no se modifica.`)) return;

    this.isSyncing = true;
    this.syncMessage = '';
    this.syncError = false;

    this.productsService.unlinkFromML(this.product.id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'ML unlink failed', err);
        this.syncMessage = 'Error al desvincular.';
        this.syncError = true;
        this.isSyncing = false;
        return EMPTY;
      }),
    ).subscribe(() => {
      this.loadProduct(this.product!.id);
      this.isSyncing = false;
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
        this.slugManuallyEdited = !!p.slug;
        this.productForm.patchValue({
          title: p.title,
          slug: p.slug ?? '',
          description: p.description,
          brand: p.brand ?? '',
          featured: p.featured ?? false,
        });
      }
    });
  }
}
