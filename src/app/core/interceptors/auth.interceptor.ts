import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { LoggerService } from '../services/logger.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);

  const token = authService.token;
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/');

      if (err.status === 401 && !isAuthEndpoint) {
        return authService.refresh().pipe(
          switchMap(() => {
            const newToken = authService.token;
            const retryReq = newToken
              ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
              : req;
            return next(retryReq);
          }),
          catchError(refreshErr => {
            logger.warn('AuthInterceptor', 'Token refresh failed — logging out');
            authService.logout();
            return throwError(() => refreshErr);
          }),
        );
      }

      if (err.status >= 500) {
        logger.error('AuthInterceptor', `Server error ${err.status}`, err);
      }

      return throwError(() => err);
    }),
  );
};
