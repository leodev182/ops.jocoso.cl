import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarNavComponent, NavItem } from '../sidebar-nav/sidebar-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarNavComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/products', label: 'Productos' },
    { path: '/stock', label: 'Stock' },
    { path: '/orders', label: 'Órdenes' },
    { path: '/mercadolibre', label: 'MercadoLibre' },
  ];

  constructor(private authService: AuthService) {}

  onLogout(): void {
    this.authService.logout();
  }
}
