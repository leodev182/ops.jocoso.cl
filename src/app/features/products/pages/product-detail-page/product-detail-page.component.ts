import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ProductsService } from '../../services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Product, CreateProductRequest, CreateVariantRequest } from '../../../../core/models/product.model';
import { VariantFormComponent } from '../../components/variant-form/variant-form.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [ReactiveFormsModule, VariantFormComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrl: './product-detail-page.component.scss',
})
export class ProductDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'ProductDetailPage';

  product: Product | null = null;
  isNew = false;
  isSaving = false;
  isSyncing = false;
  errorMessage = '';
  syncMessage = '';
  showVariantForm = false;

  productForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
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
      this.productsService
        .getById(id)
        .pipe(
          catchError(err => {
            this.logger.error(this.CONTEXT, `Failed to load product ${id}`, err);
            this.errorMessage = 'No se pudo cargar el producto.';
            return of(null);
          }),
        )
        .subscribe(p => {
          if (p) {
            this.product = p;
            this.productForm.patchValue({ title: p.title, description: p.description });
          }
        });
    }
  }

  onSaveProduct(): void {
    if (this.productForm.invalid) return;
    this.isSaving = true;
    this.errorMessage = '';

    const body: CreateProductRequest = this.productForm.value;
    this.productsService
      .create(body)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to create product', err);
          this.errorMessage = 'Error al guardar el producto.';
          this.isSaving = false;
          return of(null);
        }),
      )
      .subscribe(p => {
        if (p) {
          this.product = p;
          this.isNew = false;
          this.isSaving = false;
        }
      });
  }

  onAddVariant(body: CreateVariantRequest): void {
    if (!this.product) return;

    this.productsService
      .addVariant(this.product.id, body)
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'Failed to add variant', err);
          this.errorMessage = 'Error al agregar la variante.';
          return of(null);
        }),
      )
      .subscribe(variant => {
        if (variant) {
          this.product = {
            ...this.product!,
            variants: [...(this.product!.variants ?? []), variant],
          };
          this.showVariantForm = false;
        }
      });
  }

  onSyncToML(): void {
    if (!this.product) return;
    this.isSyncing = true;
    this.syncMessage = '';

    // Sync with hardcoded defaults; a modal for category/listing-type can be added later
    this.productsService
      .syncToML(this.product.id, {
        mlCategoryId: 'MLC1055',
        condition: 'new',
        listingType: 'gold_special',
      })
      .pipe(
        catchError(err => {
          this.logger.error(this.CONTEXT, 'ML sync failed', err);
          this.syncMessage = 'Error al sincronizar con MercadoLibre.';
          this.isSyncing = false;
          return of(null);
        }),
      )
      .subscribe(res => {
        if (res) {
          this.product = { ...this.product!, mlItemId: res.mlItemId };
          this.syncMessage = `Publicado en ML: ${res.mlItemId}`;
        }
        this.isSyncing = false;
      });
  }
}
