import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginFormComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  private readonly CONTEXT = 'LoginPage';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  onLogin(credentials: { email: string; password: string }): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(credentials.email, credentials.password).subscribe({
      next: res => {
        if (res.user.role !== 'ADMIN' && res.user.role !== 'SUPPORT') {
          this.logger.warn(this.CONTEXT, `Blocked login for role: ${res.user.role}`);
          this.errorMessage = 'Acceso restringido a administradores.';
          this.authService.logout();
          this.isLoading = false;
          return;
        }
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.logger.error(this.CONTEXT, 'Login failed', err);
        this.isLoading = false;
        this.errorMessage =
          err?.status === 401
            ? 'Credenciales incorrectas.'
            : 'Error al conectar con el servidor.';
      },
      complete: () => (this.isLoading = false),
    });
  }
}
