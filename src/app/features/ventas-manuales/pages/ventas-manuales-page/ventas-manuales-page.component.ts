import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { VentasManualesService, ClientResult, ManualOrderOrigin } from '../../services/ventas-manuales.service';
import { ProductsService } from '../../../products/services/products.service';
import { Product, ProductVariant } from '../../../../core/models/product.model';
import { LoggerService } from '../../../../core/services/logger.service';

interface CartItem {
  variantId: string;
  productTitle: string;
  sku: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-ventas-manuales-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ventas-manuales-page.component.html',
  styleUrl: './ventas-manuales-page.component.scss',
})
export class VentasManualesPageComponent {
  private readonly CONTEXT = 'VentasManualesPage';

  // ── Cliente ──────────────────────────────────────────────────────────────
  clientQuery = '';
  clientResults: ClientResult[] = [];
  selectedClient: ClientResult | null = null;
  showNewClientForm = false;
  isSearchingClient = false;
  newClient = { name: '', email: '', phone: '' };
  isCreatingClient = false;
  clientError = '';

  // ── Productos ─────────────────────────────────────────────────────────────
  productQuery = '';
  products: Product[] = [];
  isLoadingProducts = false;
  expandedProductId: string | null = null;
  expandedVariants: ProductVariant[] = [];
  variantQty: Record<string, number> = {};

  // ── Carrito ───────────────────────────────────────────────────────────────
  cart: CartItem[] = [];

  // ── Pago ──────────────────────────────────────────────────────────────────
  paymentOrigin: ManualOrderOrigin | '' = '';

  // ── Submit ────────────────────────────────────────────────────────────────
  isSubmitting = false;
  successOrderId: string | null = null;
  submitError = '';

  constructor(
    private ventasService: VentasManualesService,
    private productsService: ProductsService,
    private logger: LoggerService,
  ) {}

  // ── Cliente ──────────────────────────────────────────────────────────────

  searchClients(): void {
    if (!this.clientQuery.trim()) return;
    this.isSearchingClient = true;
    this.clientError = '';
    this.ventasService.searchClients(this.clientQuery.trim()).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error buscando clientes', err);
        this.clientError = 'Error al buscar clientes.';
        this.isSearchingClient = false;
        return of([]);
      }),
    ).subscribe(results => {
      this.clientResults = results;
      this.isSearchingClient = false;
    });
  }

  selectClient(client: ClientResult): void {
    this.selectedClient = client;
    this.clientResults = [];
    this.showNewClientForm = false;
    this.clientError = '';
  }

  clearClient(): void {
    this.selectedClient = null;
    this.clientQuery = '';
    this.clientResults = [];
  }

  toggleNewClientForm(): void {
    this.showNewClientForm = !this.showNewClientForm;
    this.clientResults = [];
    this.clientError = '';
    if (!this.showNewClientForm) {
      this.newClient = { name: '', email: '', phone: '' };
    }
  }

  createClient(): void {
    if (!this.newClient.name.trim() || !this.newClient.email.trim()) return;
    this.isCreatingClient = true;
    this.clientError = '';
    this.ventasService.createClient({
      name: this.newClient.name.trim(),
      email: this.newClient.email.trim(),
      phone: this.newClient.phone.trim() || undefined,
    }).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error creando cliente', err);
        this.clientError = err?.error?.message ?? 'Error al crear el cliente.';
        this.isCreatingClient = false;
        return of(null);
      }),
    ).subscribe(client => {
      if (client) {
        this.selectClient(client);
        this.newClient = { name: '', email: '', phone: '' };
        this.showNewClientForm = false;
      }
      this.isCreatingClient = false;
    });
  }

  // ── Productos ─────────────────────────────────────────────────────────────

  searchProducts(): void {
    this.isLoadingProducts = true;
    this.expandedProductId = null;
    this.productsService.getAll('ACTIVE', this.productQuery.trim() || undefined).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error buscando productos', err);
        this.isLoadingProducts = false;
        return of([]);
      }),
    ).subscribe(products => {
      this.products = products;
      this.isLoadingProducts = false;
    });
  }

  toggleProduct(product: Product): void {
    if (this.expandedProductId === product.id) {
      this.expandedProductId = null;
      this.expandedVariants = [];
      return;
    }
    this.expandedProductId = product.id;
    this.productsService.getById(product.id).pipe(
      catchError(() => of(null)),
    ).subscribe(full => {
      this.expandedVariants = full?.variants ?? [];
    });
  }

  addToCart(variant: ProductVariant, productTitle: string): void {
    const qty = this.variantQty[variant.id] ?? 1;
    if (qty < 1) return;
    const existing = this.cart.find(i => i.variantId === variant.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.cart.push({
        variantId: variant.id,
        productTitle,
        sku: variant.sku,
        price: Number(variant.price),
        quantity: qty,
      });
    }
    this.variantQty[variant.id] = 1;
  }

  removeFromCart(variantId: string): void {
    this.cart = this.cart.filter(i => i.variantId !== variantId);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  get canSubmit(): boolean {
    return !!this.selectedClient && this.cart.length > 0 && !!this.paymentOrigin && !this.isSubmitting;
  }

  submit(): void {
    if (!this.canSubmit || !this.selectedClient || !this.paymentOrigin) return;
    this.isSubmitting = true;
    this.submitError = '';
    this.ventasService.createOrder({
      userId: this.selectedClient.id,
      items: this.cart.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
      origin: this.paymentOrigin as ManualOrderOrigin,
    }).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error creando orden manual', err);
        this.submitError = err?.error?.message ?? 'Error al registrar la venta.';
        this.isSubmitting = false;
        return of(null);
      }),
    ).subscribe(result => {
      if (result) this.successOrderId = result.orderId;
      this.isSubmitting = false;
    });
  }

  reset(): void {
    this.selectedClient = null;
    this.clientQuery = '';
    this.clientResults = [];
    this.products = [];
    this.productQuery = '';
    this.expandedProductId = null;
    this.expandedVariants = [];
    this.cart = [];
    this.paymentOrigin = '';
    this.successOrderId = null;
    this.submitError = '';
    this.clientError = '';
  }

  formatCLP(amount: number): string {
    return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }
}
