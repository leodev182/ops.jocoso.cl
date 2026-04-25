#!/usr/bin/env python3
"""Generate 5 technical PDF articles for ops.jocoso.cl (Angular admin panel)."""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import Flowable
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Color palette ────────────────────────────────────────────────────────────
DARK_BG      = colors.HexColor('#0F172A')
ACCENT_BLUE  = colors.HexColor('#6C63FF')   # purple — Angular feel
ACCENT_CYAN  = colors.HexColor('#06B6D4')
CODE_BG      = colors.HexColor('#1E293B')
CODE_FG      = colors.HexColor('#E2E8F0')
DECISION_BG  = colors.HexColor('#FEF3C7')
DECISION_BDR = colors.HexColor('#F59E0B')
TRADEOFF_BG  = colors.HexColor('#EFF6FF')
TRADEOFF_BDR = colors.HexColor('#6C63FF')
TEXT_DARK    = colors.HexColor('#1E293B')
TEXT_MID     = colors.HexColor('#475569')
WHITE        = colors.white
LIGHT_RULE   = colors.HexColor('#CBD5E1')

PAGE_W, PAGE_H = A4


# ─── Custom Flowables ─────────────────────────────────────────────────────────

class HeaderBanner(Flowable):
    def __init__(self, title, subtitle, series, number):
        super().__init__()
        self.title    = title
        self.subtitle = subtitle
        self.series   = series
        self.number   = number
        self.width    = PAGE_W - 4 * cm
        self.height   = 68 * mm

    def draw(self):
        c = self.canv
        w, h = self.width, self.height
        c.setFillColor(DARK_BG)
        c.roundRect(0, 0, w, h, 6, fill=1, stroke=0)
        c.setFillColor(ACCENT_BLUE)
        c.rect(0, 0, 5, h, fill=1, stroke=0)
        c.setFillColor(ACCENT_BLUE)
        c.roundRect(w - 52, h - 32, 42, 22, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 10)
        c.drawCentredString(w - 31, h - 22, f"#{self.number:02d}")
        c.setFillColor(ACCENT_CYAN)
        c.setFont('Helvetica-Bold', 8)
        c.drawString(16, h - 18, self.series.upper())
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 18)
        words = self.title.split()
        line, lines = [], []
        for word in words:
            test = ' '.join(line + [word])
            if c.stringWidth(test, 'Helvetica-Bold', 18) < (w - 32):
                line.append(word)
            else:
                lines.append(' '.join(line))
                line = [word]
        lines.append(' '.join(line))
        y = h - 40
        for ln in lines:
            c.drawString(16, y, ln)
            y -= 22
        c.setFillColor(colors.HexColor('#94A3B8'))
        c.setFont('Helvetica', 11)
        c.drawString(16, 18, self.subtitle)


class ColorBox(Flowable):
    def __init__(self, label, body, bg, border, text_color=TEXT_DARK, width=None):
        super().__init__()
        self.label      = label
        self.body       = body
        self.bg         = bg
        self.border     = border
        self.text_color = text_color
        self._width     = width or (PAGE_W - 4 * cm)
        self.height     = 0

    def wrap(self, avail_w, avail_h):
        self._width = avail_w
        char_per_line = int(avail_w / 6.5)
        lines = 1 + len(self.body) // char_per_line
        self.height = max(45, 28 + lines * 14)
        return avail_w, self.height

    def draw(self):
        c = self.canv
        w, h = self._width, self.height
        c.setFillColor(self.bg)
        c.setStrokeColor(self.border)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, w, h, 5, fill=1, stroke=1)
        c.setFillColor(self.border)
        c.setFont('Helvetica-Bold', 9)
        c.drawString(10, h - 16, f"▶  {self.label}")
        c.setFillColor(self.text_color)
        c.setFont('Helvetica', 9.5)
        words = self.body.split()
        line, lines, y = [], [], h - 30
        avail = w - 20
        for word in words:
            test = ' '.join(line + [word])
            if c.stringWidth(test, 'Helvetica', 9.5) < avail:
                line.append(word)
            else:
                lines.append(' '.join(line))
                line = [word]
        lines.append(' '.join(line))
        for ln in lines:
            if y < 8:
                break
            c.drawString(10, y, ln)
            y -= 13


def code_table(snippet):
    lines = snippet.strip().split('\n')
    data = [[Paragraph(
        f'<font name="Courier" size="8" color="#E2E8F0">'
        f'{ln.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")}</font>',
        ParagraphStyle('cl', fontName='Courier', fontSize=8,
                       textColor=CODE_FG, leading=12)
    )] for ln in lines]
    t = Table(data, colWidths=[PAGE_W - 4 * cm - 4])
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), CODE_BG),
        ('TOPPADDING',   (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 4),
        ('LEFTPADDING',  (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    return t


# ─── Shared styles ────────────────────────────────────────────────────────────

def make_styles():
    styles = {}
    styles['h1'] = ParagraphStyle('h1', fontName='Helvetica-Bold', fontSize=15,
                                   textColor=ACCENT_BLUE, spaceBefore=14, spaceAfter=4, leading=20)
    styles['h2'] = ParagraphStyle('h2', fontName='Helvetica-Bold', fontSize=12,
                                   textColor=ACCENT_CYAN, spaceBefore=10, spaceAfter=3, leading=16)
    styles['body'] = ParagraphStyle('body', fontName='Helvetica', fontSize=10,
                                     textColor=TEXT_DARK, leading=15, spaceAfter=6,
                                     alignment=TA_JUSTIFY)
    styles['bullet'] = ParagraphStyle('bullet', fontName='Helvetica', fontSize=10,
                                       textColor=TEXT_DARK, leading=14, leftIndent=14,
                                       spaceAfter=3, bulletIndent=4)
    styles['caption'] = ParagraphStyle('caption', fontName='Helvetica-Oblique', fontSize=8.5,
                                        textColor=TEXT_MID, spaceAfter=8, leading=12)
    return styles


def footer_cb(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(TEXT_MID)
    canvas.drawCentredString(
        PAGE_W / 2, 18,
        f"Frontend Architecture Series — ops.jocoso.cl Admin Panel  |  Página {doc.page}"
    )
    canvas.setStrokeColor(LIGHT_RULE)
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, 25, PAGE_W - 2 * cm, 25)
    canvas.restoreState()


def build_pdf(filename, story):
    path = os.path.join(OUTPUT_DIR, filename)
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=2*cm, rightMargin=2*cm,
        topMargin=1.5*cm, bottomMargin=2*cm,
        title=filename.replace('.pdf', ''),
    )
    doc.build(story, onFirstPage=footer_cb, onLaterPages=footer_cb)
    print(f"  OK  {filename}")


S = make_styles()

def h1(text): return Paragraph(text, S['h1'])
def h2(text): return Paragraph(text, S['h2'])
def body(text): return Paragraph(text, S['body'])
def bullet(text): return Paragraph(f"• {text}", S['bullet'])
def sp(n=6): return Spacer(1, n)
def rule(): return HRFlowable(width='100%', thickness=0.5, color=LIGHT_RULE, spaceAfter=6, spaceBefore=6)
def decision_box(text): return ColorBox("Decisión Técnica", text, DECISION_BG, DECISION_BDR)
def tradeoff_box(text): return ColorBox("Trade-offs", text, TRADEOFF_BG, TRADEOFF_BDR)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTÍCULO 1 — Smart Components + Dumb Components + RxJS Services
# ══════════════════════════════════════════════════════════════════════════════

def article_01():
    story = []
    story.append(HeaderBanner(
        "Smart Components + Dumb Components + RxJS Services en Angular 19",
        "El patrón que separa datos, lógica y presentación sin Ngrx ni overhead innecesario",
        "Frontend Architecture Series — ops.jocoso.cl Admin Panel", 1
    ))
    story.append(sp(14))

    story.append(h1("El problema: componentes que lo hacen todo"))
    story.append(body(
        "El antipatrón más común en Angular: un componente que inyecta HttpClient directamente, "
        "maneja el estado local, formatea datos y renderiza la UI. Cuando el diseño cambia o "
        "el endpoint muta, hay que tocar el mismo archivo en tres lugares distintos. "
        "En un panel admin con 5 features y múltiples tablas reutilizables, esto escala mal."
    ))
    story.append(sp(4))

    story.append(decision_box(
        "Adoptar el patrón Smart Components + Dumb Components + RxJS Services. "
        "Los Smart Components (pages/) orquestan datos y lógica. "
        "Los Dumb Components (components/) solo reciben @Input y emiten @Output. "
        "Los Services encapsulan toda la comunicación con el backend."
    ))
    story.append(sp(8))

    story.append(h1("La estructura de carpetas como contrato"))
    story.append(body(
        "La convención de carpetas hace explícita la responsabilidad de cada archivo. "
        "Un desarrollador nuevo sabe que en pages/ hay lógica y en components/ hay UI pura:"
    ))
    story.append(code_table(
        "features/products/\n"
        "├── services/\n"
        "│   └── products.service.ts       ← HTTP, lógica de datos\n"
        "├── pages/                        ← Smart Components\n"
        "│   ├── products-list-page/\n"
        "│   │   └── products-list-page.component.ts   ← inyecta servicio\n"
        "│   └── product-detail-page/\n"
        "│       └── product-detail-page.component.ts\n"
        "└── components/                   ← Dumb Components\n"
        "    ├── product-table/\n"
        "    │   └── product-table.component.ts        ← solo @Input/@Output\n"
        "    └── variant-form/\n"
        "        └── variant-form.component.ts"
    ))
    story.append(sp(8))

    story.append(h1("El Smart Component: orquestador"))
    story.append(body(
        "El Smart Component inyecta el servicio, maneja errores, transforma datos si es necesario "
        "y los pasa al Dumb Component vía @Input. Reacciona a los @Output del Dumb Component "
        "y decide qué acción tomar — navegar, llamar al servicio, actualizar estado:"
    ))
    story.append(code_table(
        "// pages/products-list-page/products-list-page.component.ts\n"
        "@Component({\n"
        "  standalone: true,\n"
        "  imports: [ProductTableComponent, AsyncPipe],\n"
        "  template: `\n"
        "    <app-product-table\n"
        "      [products]=\"products$ | async\"\n"
        "      (productClick)=\"onProductClick($event)\"\n"
        "    ></app-product-table>\n"
        "  `\n"
        "})\n"
        "export class ProductsListPageComponent implements OnInit {\n"
        "  products$!: Observable<Product[]>;\n\n"
        "  constructor(\n"
        "    private productsService: ProductsService,\n"
        "    private router: Router,\n"
        "  ) {}\n\n"
        "  ngOnInit(): void {\n"
        "    this.products$ = this.productsService.getAll().pipe(\n"
        "      catchError(err => { this.logger.error(...); return of([]); })\n"
        "    );\n"
        "  }\n\n"
        "  onProductClick(product: Product): void {\n"
        "    this.router.navigate(['/products', product.id]);\n"
        "  }\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("El Dumb Component: presentación pura"))
    story.append(body(
        "El Dumb Component no sabe de dónde vienen los datos ni a dónde van. "
        "No inyecta servicios. No conoce Router. Solo sabe que recibe productos "
        "y emite eventos cuando el usuario interactúa:"
    ))
    story.append(code_table(
        "// components/product-table/product-table.component.ts\n"
        "@Component({\n"
        "  standalone: true,\n"
        "  imports: [DatePipe],\n"
        "  selector: 'app-product-table',\n"
        "})\n"
        "export class ProductTableComponent {\n"
        "  @Input() products: Product[] = [];\n"
        "  @Output() productClick = new EventEmitter<Product>();\n"
        "  // Nada más. Sin constructor. Sin servicios.\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("El Service: única fuente de verdad HTTP"))
    story.append(body(
        "El servicio encapsula todos los detalles de comunicación con el backend. "
        "Conoce las URLs, los tipos de respuesta y el LoggerService. "
        "No conoce componentes, Router ni estado de UI:"
    ))
    story.append(code_table(
        "// services/products.service.ts\n"
        "@Injectable({ providedIn: 'root' })\n"
        "export class ProductsService {\n"
        "  constructor(\n"
        "    private api: ApiService,\n"
        "    private logger: LoggerService,\n"
        "  ) {}\n\n"
        "  getAll(status?: ProductStatus): Observable<Product[]> {\n"
        "    return this.api.get<Product[]>('/products', status ? { status } : undefined);\n"
        "  }\n\n"
        "  create(body: CreateProductRequest): Observable<Product> {\n"
        "    return this.api.post<Product>('/products', body);\n"
        "  }\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("AsyncPipe: suscripción sin boilerplate"))
    story.append(body(
        "El Smart Component expone Observables — no arrays. "
        "La suscripción ocurre en el template con AsyncPipe, que además cancela "
        "automáticamente la suscripción cuando el componente se destruye. "
        "Esto elimina el patrón takeUntil/ngOnDestroy para la mayoría de los casos:"
    ))
    story.append(code_table(
        "<!-- Smart component template -->\n"
        "@if (products$ | async; as products) {\n"
        "  <app-product-table\n"
        "    [products]=\"products\"\n"
        "    (productClick)=\"onProductClick($event)\"\n"
        "  ></app-product-table>\n"
        "}"
    ))
    story.append(sp(8))

    story.append(tradeoff_box(
        "Smart/Dumb vs NgRx Store. NgRx ofrece DevTools, time-travel debugging y "
        "un modelo de estado predecible — ideal para apps con estado compartido entre features. "
        "Para un panel admin donde cada feature es independiente y los datos viven en el servidor, "
        "NgRx agrega ~40% de boilerplate (actions, reducers, effects, selectors) sin beneficio real. "
        "Smart/Dumb + RxJS Services cubre el 100% de los casos de uso con mucho menos código."
    ))
    story.append(sp(10))

    story.append(h1("Conclusión"))
    story.append(body(
        "La regla es simple: si un componente inyecta un servicio, vive en pages/. "
        "Si un componente solo tiene @Input y @Output, vive en components/. "
        "Esta convención se auto-documenta con la estructura de carpetas y "
        "permite reutilizar cualquier Dumb Component en múltiples Smart Components sin riesgo."
    ))

    build_pdf("01-smart-dumb-components-rxjs.pdf", story)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTÍCULO 2 — JWT en Angular: interceptor, guard y session restore
# ══════════════════════════════════════════════════════════════════════════════

def article_02():
    story = []
    story.append(HeaderBanner(
        "JWT en Angular 19: Interceptor, AuthGuard y restauración de sesión",
        "Access token en memoria, refresh token en localStorage y APP_INITIALIZER para UX sin fricciones",
        "Frontend Architecture Series — ops.jocoso.cl Admin Panel", 2
    ))
    story.append(sp(14))

    story.append(h1("El problema del token en el frontend"))
    story.append(body(
        "Guardar el JWT en localStorage es vulnerable a XSS: cualquier script inyectado "
        "puede leerlo. Guardarlo en una cookie HttpOnly lo protege de JS pero complica "
        "el flujo CORS. Para un panel admin, la solución pragmática es: "
        "access token en memoria (variable de clase), refresh token en localStorage. "
        "El access token no sobrevive un F5 — el refresh token sí."
    ))
    story.append(sp(4))

    story.append(decision_box(
        "Access token (15 min) en BehaviorSubject en memoria — nunca toca el DOM ni localStorage. "
        "Refresh token en localStorage con clave prefijada ('ops_refresh_token'). "
        "APP_INITIALIZER restaura la sesión en cada carga llamando a /auth/refresh "
        "antes de que el router active cualquier ruta."
    ))
    story.append(sp(8))

    story.append(h1("AuthService: la única fuente de verdad del usuario"))
    story.append(code_table(
        "@Injectable({ providedIn: 'root' })\n"
        "export class AuthService {\n"
        "  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);\n"
        "  readonly currentUser$ = this.currentUserSubject.asObservable();\n"
        "  private _accessToken: string | null = null;\n\n"
        "  get token(): string | null { return this._accessToken; }\n"
        "  isAuthenticated(): boolean {\n"
        "    return !!this._accessToken && !!this.currentUserSubject.value;\n"
        "  }\n\n"
        "  private applyTokens(access: string, refresh: string): void {\n"
        "    this._accessToken = access;\n"
        "    localStorage.setItem('ops_refresh_token', refresh);\n"
        "    const payload = JSON.parse(atob(access.split('.')[1]));\n"
        "    this.currentUserSubject.next(payload);\n"
        "  }\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("APP_INITIALIZER: F5 sin login"))
    story.append(body(
        "Sin APP_INITIALIZER, cada vez que el usuario recarga la página el access token "
        "desaparece (estaba en memoria) y el AuthGuard lo redirige a /login aunque tenga "
        "un refresh token válido. APP_INITIALIZER corre antes de que Angular active el router, "
        "restaurando la sesión de forma transparente:"
    ))
    story.append(code_table(
        "// app.config.ts\n"
        "export const appConfig: ApplicationConfig = {\n"
        "  providers: [\n"
        "    provideRouter(routes),\n"
        "    provideHttpClient(withInterceptors([authInterceptor])),\n"
        "    {\n"
        "      provide: APP_INITIALIZER,\n"
        "      useFactory: (auth: AuthService) => () => auth.tryRestoreSession(),\n"
        "      deps: [AuthService],\n"
        "      multi: true,\n"
        "    },\n"
        "  ],\n"
        "};\n\n"
        "// auth.service.ts\n"
        "tryRestoreSession(): Promise<void> {\n"
        "  const refreshToken = localStorage.getItem('ops_refresh_token');\n"
        "  if (!refreshToken) return Promise.resolve();\n\n"
        "  return this.api.post('/auth/refresh', { refreshToken }).pipe(\n"
        "    tap(res => this.applyTokens(res.accessToken, res.refreshToken)),\n"
        "    catchError(() => { localStorage.removeItem('ops_refresh_token'); return of(null); }),\n"
        "    map(() => undefined),\n"
        "  ).toPromise();\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("AuthInterceptor funcional: Bearer en cada request"))
    story.append(body(
        "Angular 19 permite interceptores funcionales — sin clase, sin @Injectable. "
        "El interceptor lee el token del AuthService e intercepta los 401 para hacer logout:"
    ))
    story.append(code_table(
        "// core/interceptors/auth.interceptor.ts\n"
        "export const authInterceptor: HttpInterceptorFn = (req, next) => {\n"
        "  const authService = inject(AuthService);\n"
        "  const logger = inject(LoggerService);\n\n"
        "  const token = authService.token;\n"
        "  const authReq = token\n"
        "    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })\n"
        "    : req;\n\n"
        "  return next(authReq).pipe(\n"
        "    catchError((err: HttpErrorResponse) => {\n"
        "      if (err.status === 401 && !req.url.includes('/auth/')) {\n"
        "        logger.warn('AuthInterceptor', 'Session expired');\n"
        "        authService.logout();\n"
        "      }\n"
        "      return throwError(() => err);\n"
        "    }),\n"
        "  );\n"
        "};"
    ))
    story.append(sp(8))

    story.append(h1("AuthGuard funcional"))
    story.append(body(
        "El guard protege todas las rutas dentro del Shell. Si isAuthenticated() retorna false "
        "(access token nulo tras un F5 antes del APP_INITIALIZER), redirige a /login. "
        "Después del APP_INITIALIZER, el token ya está restaurado — el guard pasa siempre:"
    ))
    story.append(code_table(
        "// core/auth/auth.guard.ts\n"
        "export const authGuard: CanActivateFn = () => {\n"
        "  const auth = inject(AuthService);\n"
        "  const router = inject(Router);\n"
        "  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);\n"
        "};"
    ))
    story.append(sp(8))

    story.append(h1("Login con validación de rol"))
    story.append(body(
        "El endpoint /auth/login sirve a todos los roles. El panel admin solo permite "
        "ADMIN y SUPPORT. Si un CUSTOMER intenta ingresar, el LoginPage hace logout "
        "inmediatamente y muestra un error — nunca llega a ver el dashboard:"
    ))
    story.append(code_table(
        "// features/auth/pages/login-page/login-page.component.ts\n"
        "onLogin(credentials: { email: string; password: string }): void {\n"
        "  this.authService.login(credentials.email, credentials.password).subscribe({\n"
        "    next: res => {\n"
        "      if (res.user.role !== 'ADMIN' && res.user.role !== 'SUPPORT') {\n"
        "        this.authService.logout();\n"
        "        this.errorMessage = 'Acceso restringido a administradores.';\n"
        "        return;\n"
        "      }\n"
        "      this.router.navigate(['/dashboard']);\n"
        "    },\n"
        "    error: err => {\n"
        "      this.errorMessage = err?.status === 401\n"
        "        ? 'Credenciales incorrectas.'\n"
        "        : 'Error al conectar con el servidor.';\n"
        "    },\n"
        "  });\n"
        "}"
    ))
    story.append(sp(8))

    story.append(tradeoff_box(
        "Access token en memoria vs cookie HttpOnly. La cookie HttpOnly elimina el riesgo XSS "
        "sobre el token, pero requiere configurar SameSite y CORS en el backend, y complica "
        "el flujo en desarrollo con múltiples puertos. Para un panel admin (no público, "
        "usuarios técnicos, riesgo XSS bajo) el tradeoff es favorable: memoria es más simple "
        "y el refresh token en localStorage solo expone el token de larga duración, "
        "no el de acceso."
    ))

    build_pdf("02-jwt-auth-angular.pdf", story)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTÍCULO 3 — Arquitectura híbrida: standalone + NgModule + lazy loading
# ══════════════════════════════════════════════════════════════════════════════

def article_03():
    story = []
    story.append(HeaderBanner(
        "Angular 19: Arquitectura híbrida standalone + NgModule con lazy loading",
        "Cómo mezclar el nuevo paradigma standalone con módulos existentes sin romper nada",
        "Frontend Architecture Series — ops.jocoso.cl Admin Panel", 3
    ))
    story.append(sp(14))

    story.append(h1("El contexto: Angular en transición"))
    story.append(body(
        "Angular 14 introdujo componentes standalone. Angular 19 los recomienda como default. "
        "Pero muchos proyectos tienen NgModules existentes — reescribirlos no tiene ROI. "
        "La solución pragmática: raíz standalone (bootstrapApplication), "
        "features en NgModules lazy-loaded, componentes nuevos como standalone dentro de esos módulos."
    ))
    story.append(sp(4))

    story.append(decision_box(
        "Root standalone con ApplicationConfig. Features en NgModules lazy-loaded. "
        "Todos los componentes nuevos son standalone — se declaran en imports[] del NgModule, "
        "no en declarations[]. Esto permite migrar feature por feature sin big bang."
    ))
    story.append(sp(8))

    story.append(h1("Bootstrap sin AppModule"))
    story.append(code_table(
        "// main.ts\n"
        "bootstrapApplication(AppComponent, appConfig);\n\n"
        "// app.config.ts — todo el wiring en un solo lugar\n"
        "export const appConfig: ApplicationConfig = {\n"
        "  providers: [\n"
        "    provideZoneChangeDetection({ eventCoalescing: true }),\n"
        "    provideRouter(routes),\n"
        "    provideHttpClient(withInterceptors([authInterceptor])),\n"
        "    { provide: APP_INITIALIZER, ... },\n"
        "  ],\n"
        "};"
    ))
    story.append(sp(8))

    story.append(h1("Lazy loading con ShellComponent como layout guard"))
    story.append(body(
        "El ShellComponent (standalone) actúa como contenedor del layout autenticado. "
        "Todas las features protegidas son hijas del Shell. El authGuard se aplica una sola vez "
        "en la ruta padre — no en cada feature:"
    ))
    story.append(code_table(
        "// app.routes.ts\n"
        "export const routes: Routes = [\n"
        "  {\n"
        "    path: 'login',\n"
        "    loadChildren: () =>\n"
        "      import('./features/auth/auth.module').then(m => m.AuthModule),\n"
        "  },\n"
        "  {\n"
        "    path: '',\n"
        "    component: ShellComponent,      // layout\n"
        "    canActivate: [authGuard],        // una sola vez\n"
        "    children: [\n"
        "      { path: 'dashboard', loadChildren: () => import('./features/dashboard/...') },\n"
        "      { path: 'products',  loadChildren: () => import('./features/products/...') },\n"
        "      { path: 'stock',     loadChildren: () => import('./features/stock/...') },\n"
        "      { path: 'orders',    loadChildren: () => import('./features/orders/...') },\n"
        "    ],\n"
        "  },\n"
        "];"
    ))
    story.append(sp(8))

    story.append(h1("NgModule que importa standalone components"))
    story.append(body(
        "Los NgModules de features no declaran componentes en declarations[]. "
        "Los standalone components van en imports[]. Esto es la diferencia clave "
        "en la arquitectura híbrida:"
    ))
    story.append(code_table(
        "// features/products/products.module.ts\n"
        "@NgModule({\n"
        "  imports: [\n"
        "    CommonModule,\n"
        "    ProductsRoutingModule,\n"
        "    // Standalone components van en imports[], NO en declarations[]\n"
        "    ProductsListPageComponent,\n"
        "    ProductDetailPageComponent,\n"
        "    ProductTableComponent,\n"
        "    VariantFormComponent,\n"
        "  ],\n"
        "  // declarations: []  ← vacío, ningún componente clásico\n"
        "})\n"
        "export class ProductsModule {}"
    ))
    story.append(sp(8))

    story.append(h1("Componente standalone: imports explícitos"))
    story.append(body(
        "Los standalone components importan exactamente lo que necesitan. "
        "No hay módulo que 'exporte todo' y contamine el scope. "
        "Si un componente usa DatePipe, lo importa. Si usa RouterLink, lo importa:"
    ))
    story.append(code_table(
        "@Component({\n"
        "  selector: 'app-product-table',\n"
        "  standalone: true,\n"
        "  imports: [DatePipe],  // solo lo que necesita\n"
        "  templateUrl: './product-table.component.html',\n"
        "})\n"
        "export class ProductTableComponent {\n"
        "  @Input() products: Product[] = [];\n"
        "  @Output() productClick = new EventEmitter<Product>();\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("Control flow de Angular 17+: @if y @for"))
    story.append(body(
        "El proyecto usa la nueva sintaxis de control flow (@if, @for, @empty) "
        "en lugar de *ngIf y *ngFor. No requiere importar NgIf ni NgFor en el componente — "
        "es parte del compilador. Los templates son más legibles y el bundle más liviano:"
    ))
    story.append(code_table(
        "<!-- Antes (requería importar NgFor, NgIf) -->\n"
        "<tr *ngFor=\"let p of products\">\n"
        "  <td *ngIf=\"p.mlItemId\">{{ p.mlItemId }}</td>\n"
        "</tr>\n\n"
        "<!-- Ahora (sin imports extra) -->\n"
        "@for (p of products; track p.id) {\n"
        "  <tr>\n"
        "    <td>{{ p.mlItemId ?? '—' }}</td>\n"
        "  </tr>\n"
        "} @empty {\n"
        "  <tr><td colspan=\"5\">Sin productos.</td></tr>\n"
        "}"
    ))
    story.append(sp(8))

    story.append(tradeoff_box(
        "NgModule lazy loading vs Routes standalone lazy loading. Angular 19 permite "
        "lazy loading de standalone components directamente en routes con loadComponent(). "
        "El proyecto usa NgModules por compatibilidad con el scaffolding inicial. "
        "La migración a loadComponent() es posible feature por feature — "
        "el contrato de lazy loading se mantiene igual desde el router."
    ))

    build_pdf("03-hybrid-architecture-angular.pdf", story)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTÍCULO 4 — Error handling y LoggerService
# ══════════════════════════════════════════════════════════════════════════════

def article_04():
    story = []
    story.append(HeaderBanner(
        "Error Handling en Angular: LoggerService + catchError + HttpErrorResponse",
        "Sin console.log dispersos: una estrategia de errores coherente y preparada para producción",
        "Frontend Architecture Series — ops.jocoso.cl Admin Panel", 4
    ))
    story.append(sp(14))

    story.append(h1("El problema: console.log en producción"))
    story.append(body(
        "El antipatrón más frecuente en proyectos Angular: console.log('error:', err) "
        "dispersos por servicios y componentes. En producción esto expone información "
        "sensible en la consola del navegador, mezcla debug con errores reales, "
        "y hace imposible integrar un sistema de monitoreo externo sin refactoring masivo."
    ))
    story.append(sp(4))

    story.append(decision_box(
        "LoggerService centralizado que reemplaza todo uso directo de console.*. "
        "debug() e info() solo emiten en development. warn() y error() siempre emiten "
        "y están preparados para integrar Sentry/Datadog con un solo cambio. "
        "catchError() en cada suscripción — nunca se propaga un error sin manejar."
    ))
    story.append(sp(8))

    story.append(h1("LoggerService: preparado para producción"))
    story.append(code_table(
        "// core/services/logger.service.ts\n"
        "@Injectable({ providedIn: 'root' })\n"
        "export class LoggerService {\n"
        "  private readonly isDev = !environment.production;\n\n"
        "  debug(context: string, message: string, ...data: unknown[]): void {\n"
        "    if (this.isDev) console.debug(`[${context}] ${message}`, ...data);\n"
        "  }\n\n"
        "  info(context: string, message: string, ...data: unknown[]): void {\n"
        "    if (this.isDev) console.info(`[${context}] ${message}`, ...data);\n"
        "  }\n\n"
        "  warn(context: string, message: string, ...data: unknown[]): void {\n"
        "    console.warn(`[${context}] ${message}`, ...data);\n"
        "  }\n\n"
        "  // Placeholder para Sentry, Datadog, etc.\n"
        "  error(context: string, message: string, error?: unknown): void {\n"
        "    console.error(`[${context}] ${message}`, error ?? '');\n"
        "  }\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("catchError en servicios vs en componentes"))
    story.append(body(
        "La pregunta frecuente: ¿dónde poner el catchError? La respuesta depende "
        "de quién puede recuperarse del error. En ops.jocoso.cl la convención es:"
    ))
    story.append(bullet("El Service NO tiene catchError — retorna el Observable tal cual"))
    story.append(bullet("El Smart Component tiene catchError — sabe qué mostrar al usuario"))
    story.append(bullet("El Interceptor tiene catchError para los casos transversales (401, 5xx)"))
    story.append(sp(6))
    story.append(code_table(
        "// Smart Component — maneja el error con contexto de UI\n"
        "this.products$ = this.productsService.getAll().pipe(\n"
        "  catchError((err: HttpErrorResponse) => {\n"
        "    this.logger.error('ProductsListPage', 'Failed to load products', err);\n"
        "    this.loadError = err.status === 404\n"
        "      ? 'No se encontraron productos.'\n"
        "      : 'No se pudieron cargar los productos.';\n"
        "    return of([]);  // el Observable no muere — la tabla queda vacía\n"
        "  }),\n"
        ");"
    ))
    story.append(sp(8))

    story.append(h1("El patrón 'Observable que no muere'"))
    story.append(body(
        "Cuando AsyncPipe suscribe a un Observable que lanza error, "
        "Angular lo desconecta y el template queda congelado. "
        "El patrón correcto: catchError retorna of([]) u of(null) "
        "para que el Observable complete con un valor vacío en lugar de fallar:"
    ))
    story.append(code_table(
        "// MAL: el Observable muere, la UI queda congelada\n"
        "this.products$ = this.productsService.getAll();\n"
        "// Si getAll() falla, el @if (products$ | async) nunca renderiza nada\n\n"
        "// BIEN: el Observable siempre completa\n"
        "this.products$ = this.productsService.getAll().pipe(\n"
        "  catchError(() => of([]))  // vacío en error, AsyncPipe recibe [] y renderiza @empty\n"
        ");"
    ))
    story.append(sp(8))

    story.append(h1("Interceptor: errores transversales"))
    story.append(body(
        "El AuthInterceptor maneja los dos casos que aplican a TODAS las requests: "
        "401 (sesión expirada → logout) y 5xx (error de servidor → log para monitoreo). "
        "No maneja 400, 404 o 422 — esos son específicos de cada feature:"
    ))
    story.append(code_table(
        "export const authInterceptor: HttpInterceptorFn = (req, next) => {\n"
        "  const logger = inject(LoggerService);\n"
        "  return next(authReq).pipe(\n"
        "    catchError((err: HttpErrorResponse) => {\n"
        "      if (err.status === 401 && !req.url.includes('/auth/')) {\n"
        "        logger.warn('Interceptor', 'Session expired → logout');\n"
        "        inject(AuthService).logout();\n"
        "      } else if (err.status >= 500) {\n"
        "        logger.error('Interceptor', `Server error ${err.status}`, err);\n"
        "        // aquí iría Sentry.captureException(err)\n"
        "      }\n"
        "      return throwError(() => err);  // propaga para que el componente maneje\n"
        "    }),\n"
        "  );\n"
        "};"
    ))
    story.append(sp(8))

    story.append(h1("Mensajes de error tipados por status code"))
    story.append(body(
        "Los mensajes de error que ve el usuario deben ser accionables. "
        "'Error desconocido' no ayuda a nadie. El patrón en los Smart Components "
        "tipifica el mensaje según el status HTTP:"
    ))
    story.append(code_table(
        "error: (err: HttpErrorResponse) => {\n"
        "  this.errorMessage = err.status === 401 ? 'Credenciales incorrectas.'\n"
        "    : err.status === 403              ? 'Sin permisos para esta acción.'\n"
        "    : err.status === 404              ? 'Recurso no encontrado.'\n"
        "    : err.status >= 500               ? 'Error del servidor. Intenta más tarde.'\n"
        "    :                                   'Error inesperado.';\n"
        "}"
    ))
    story.append(sp(8))

    story.append(tradeoff_box(
        "LoggerService simple vs librería de logging (loglevel, ngx-logger). "
        "Una librería externa agrega configuración y dependencia. Para ops.jocoso.cl "
        "el LoggerService propio tiene todo lo necesario: niveles, contexto, supresión en prod "
        "y un placeholder para integración externa. Si en el futuro se necesita Sentry, "
        "se agrega en el método error() — sin tocar ningún componente."
    ))

    build_pdf("04-error-handling-logger.pdf", story)


# ══════════════════════════════════════════════════════════════════════════════
#  ARTÍCULO 5 — ML OAuth desde Angular: por qué window.location y no HttpClient
# ══════════════════════════════════════════════════════════════════════════════

def article_05():
    story = []
    story.append(HeaderBanner(
        "MercadoLibre OAuth desde Angular: window.location vs HttpClient",
        "Por qué los flujos OAuth2 con redirección no se manejan con AJAX, y cómo integrarlos",
        "Frontend Architecture Series — ops.jocoso.cl Admin Panel", 5
    ))
    story.append(sp(14))

    story.append(h1("El malentendido frecuente"))
    story.append(body(
        "Cuando el backend expone GET /ml/oauth/authorize, la reacción instintiva "
        "es llamarlo con HttpClient y manejar la respuesta en Angular. "
        "El problema: ese endpoint retorna un HTTP 302 con Location header. "
        "HttpClient sigue el redirect automáticamente — pero el destino es auth.mercadolibre.cl, "
        "un dominio externo con sus propias políticas CORS. La respuesta es un error de CORS "
        "o una página HTML que Angular no puede procesar."
    ))
    story.append(sp(4))

    story.append(decision_box(
        "Para flujos OAuth2 Authorization Code Flow, el navegador debe navegar a la URL "
        "de autorización — no hacer una petición AJAX. "
        "La solución: window.location.href apunta directamente a la URL del backend. "
        "El backend redirige a ML, ML redirige al callback del backend, "
        "el backend redirige de vuelta al panel. Angular no interviene en el flujo OAuth."
    ))
    story.append(sp(8))

    story.append(h1("Por qué 302 + CORS no mezclan"))
    story.append(body(
        "CORS (Cross-Origin Resource Sharing) protege al navegador de requests AJAX "
        "a dominios externos sin autorización explícita. Cuando HttpClient sigue un redirect "
        "hacia auth.mercadolibre.cl, el navegador hace una preflight OPTIONS "
        "que ML no va a responder con los headers CORS correctos para tu dominio. "
        "El resultado es un error de red — el flujo OAuth muere silenciosamente."
    ))
    story.append(sp(4))
    story.append(body(
        "window.location.href no tiene estas restricciones: es una navegación del navegador, "
        "no una petición AJAX. El navegador puede navegar a cualquier URL sin restricciones CORS. "
        "Los redirects 302 funcionan exactamente como están diseñados."
    ))
    story.append(sp(8))

    story.append(h1("La implementación"))
    story.append(code_table(
        "// features/mercadolibre/services/mercadolibre.service.ts\n"
        "@Injectable({ providedIn: 'root' })\n"
        "export class MercadolibreService {\n"
        "  private readonly oauthUrl = `${environment.apiUrl}/ml/oauth/authorize`;\n\n"
        "  // No usa HttpClient — es una navegación del navegador\n"
        "  redirectToAuthorize(): void {\n"
        "    this.logger.info('MercadolibreService', 'Redirecting to ML OAuth');\n"
        "    window.location.href = this.oauthUrl;\n"
        "  }\n"
        "}\n\n"
        "// El Smart Component solo delega\n"
        "export class MlConnectPageComponent {\n"
        "  onConnect(): void {\n"
        "    this.mlService.redirectToAuthorize();\n"
        "  }\n"
        "}"
    ))
    story.append(sp(8))

    story.append(h1("El flujo completo"))
    story.append(code_table(
        "1. Admin hace clic en 'Conectar con MercadoLibre'\n"
        "   ↓\n"
        "2. window.location.href = 'https://api.jocoso.cl/api/v1/ml/oauth/authorize'\n"
        "   (navegación real del browser, no AJAX)\n"
        "   ↓\n"
        "3. Backend responde 302 → auth.mercadolibre.cl/authorization?...\n"
        "   (el browser sigue el redirect automáticamente)\n"
        "   ↓\n"
        "4. Admin ve la pantalla de ML, autoriza el acceso\n"
        "   ↓\n"
        "5. ML hace 302 → https://api.jocoso.cl/ml/oauth/callback?code=...\n"
        "   ↓\n"
        "6. Backend intercambia el code por access_token + refresh_token de ML\n"
        "   Los guarda en BD. Hace 302 → https://ops.jocoso.cl/mercadolibre\n"
        "   ↓\n"
        "7. Angular carga ops.jocoso.cl/mercadolibre con la sesión ya restaurada\n"
        "   (APP_INITIALIZER ejecuta tryRestoreSession antes del router)\n"
        "   ↓\n"
        "8. El panel muestra 'Cuenta conectada' — flujo completo"
    ))
    story.append(sp(8))

    story.append(h1("Por qué el backend maneja el callback"))
    story.append(body(
        "ML envía el authorization code al callback del backend, no al frontend. "
        "Esto es correcto: el backend tiene el client_secret de ML — el frontend nunca "
        "debe tenerlo. Exponer el client_secret en el bundle de Angular significaría "
        "que cualquier usuario podría verlo en las DevTools."
    ))
    story.append(sp(4))
    story.append(bullet("client_id: puede estar en el frontend (no es secreto)"))
    story.append(bullet("client_secret: solo en el backend (variable de entorno)"))
    story.append(bullet("authorization_code: solo viaja server-side"))
    story.append(bullet("access_token de ML: guardado cifrado en BD del backend"))
    story.append(sp(8))

    story.append(h1("Token ML vs Token de usuario"))
    story.append(body(
        "Hay dos pares de tokens completamente independientes en el sistema:"
    ))
    story.append(bullet(
        "Token de usuario (JWT): identifica al admin en ops.jocoso.cl. "
        "Generado por el backend de Jocoso. Vive en el frontend (memoria + localStorage)."
    ))
    story.append(bullet(
        "Token de ML (OAuth2): autoriza al backend de Jocoso a actuar como vendedor en ML. "
        "Generado por MercadoLibre. Vive únicamente en el backend (BD cifrada). "
        "El frontend nunca lo ve."
    ))
    story.append(sp(8))

    story.append(h1("Sincronización de productos desde el panel"))
    story.append(body(
        "Una vez conectada la cuenta ML (OAuth hecho una sola vez), "
        "el panel puede sincronizar productos individuales via POST /ml/products/:id/sync. "
        "Este sí es un request AJAX normal — el backend usa el token ML guardado en BD "
        "para llamar a la API de ML de forma transparente para el frontend:"
    ))
    story.append(code_table(
        "// ProductDetailPage llama al servicio después del OAuth\n"
        "onSyncToML(): void {\n"
        "  this.productsService.syncToML(this.product.id, {\n"
        "    mlCategoryId: 'MLC1055',\n"
        "    condition: 'new',\n"
        "    listingType: 'gold_special',\n"
        "  }).subscribe(res => {\n"
        "    // El backend llamó a ML con su token guardado\n"
        "    // Nos devuelve el mlItemId ya registrado\n"
        "    this.product = { ...this.product, mlItemId: res.mlItemId };\n"
        "  });\n"
        "}"
    ))
    story.append(sp(8))

    story.append(tradeoff_box(
        "window.location (navegación completa) vs popup OAuth. Algunos sistemas abren "
        "el flujo OAuth en un popup (window.open) y usan postMessage para recibir el resultado "
        "sin abandonar la página. Para ops.jocoso.cl el tradeoff es favorable a la navegación "
        "completa: es más simple, funciona en todos los browsers sin bloqueo de popups, "
        "y el flujo OAuth de ML se hace una sola vez — la UX de 'salir y volver' "
        "es perfectamente aceptable."
    ))
    story.append(sp(10))

    story.append(h1("Conclusión"))
    story.append(body(
        "La integración OAuth2 desde Angular no requiere código complejo. "
        "Requiere entender la separación de responsabilidades: "
        "el navegador maneja los redirects, el backend maneja los secretos, "
        "y Angular solo necesita saber la URL inicial y cómo mostrar el resultado. "
        "El error más caro es intentar manejar OAuth con AJAX cuando está diseñado "
        "para funcionar con navegación del browser."
    ))

    build_pdf("05-ml-oauth-angular.pdf", story)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    print("Generando artículos PDF — ops.jocoso.cl Admin Panel...")
    article_01()
    article_02()
    article_03()
    article_04()
    article_05()
    print("\nTodos los PDFs generados en:", OUTPUT_DIR)
