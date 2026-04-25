import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { ShellComponent } from './shared/components/shell/shell.component';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.module').then(m => m.ProductsModule),
      },
      {
        path: 'stock',
        loadChildren: () =>
          import('./features/stock/stock.module').then(m => m.StockModule),
      },
      {
        path: 'orders',
        loadChildren: () =>
          import('./features/orders/orders.module').then(m => m.OrdersModule),
      },
      {
        path: 'mercadolibre',
        loadChildren: () =>
          import('./features/mercadolibre/mercadolibre.module').then(m => m.MercadolibreModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
