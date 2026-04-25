import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from '../http/api.service';
import { LoggerService } from '../services/logger.service';
import { AuthUser, AuthResponse, AuthRefreshResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CONTEXT = 'AuthService';
  private readonly REFRESH_KEY = 'ops_refresh_token';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private _accessToken: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  get token(): string | null {
    return this._accessToken;
  }

  isAuthenticated(): boolean {
    return !!this._accessToken && !!this.currentUserSubject.value;
  }

  // Called by APP_INITIALIZER to restore session on page reload
  tryRestoreSession(): Promise<void> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (!refreshToken) return Promise.resolve();

    return this.api
      .post<AuthRefreshResponse>('/auth/refresh', { refreshToken })
      .pipe(
        tap(res => this.applyTokens(res.accessToken, res.refreshToken)),
        catchError(err => {
          this.logger.warn(this.CONTEXT, 'Failed to restore session', err);
          localStorage.removeItem(this.REFRESH_KEY);
          return of(null);
        }),
        map(() => undefined as void),
      )
      .toPromise() as Promise<void>;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap(res => {
        this.applyTokens(res.accessToken, res.refreshToken);
        this.currentUserSubject.next(res.user);
        this.logger.info(this.CONTEXT, `Login OK — role: ${res.user.role}`);
      }),
    );
  }

  logout(): void {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    if (refreshToken && this._accessToken) {
      this.api.post('/auth/logout', { refreshToken }).subscribe({
        error: err => this.logger.warn(this.CONTEXT, 'Logout request failed', err),
      });
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private applyTokens(accessToken: string, refreshToken: string): void {
    this._accessToken = accessToken;
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    const payload = this.decodeJwt(accessToken);
    this.currentUserSubject.next({ id: payload.id, email: payload.email, role: payload.role });
  }

  private clearSession(): void {
    this._accessToken = null;
    localStorage.removeItem(this.REFRESH_KEY);
    this.currentUserSubject.next(null);
  }

  private decodeJwt(token: string): { id: string; email: string; role: 'ADMIN' | 'SUPPORT' | 'CUSTOMER' } {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      this.logger.error(this.CONTEXT, 'Invalid JWT payload');
      throw new Error('Invalid token');
    }
  }
}
