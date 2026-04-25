import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly isDev = !environment.production;

  debug(context: string, message: string, ...data: unknown[]): void {
    if (this.isDev) {
      console.debug(`[${context}] ${message}`, ...data);
    }
  }

  info(context: string, message: string, ...data: unknown[]): void {
    if (this.isDev) {
      console.info(`[${context}] ${message}`, ...data);
    }
  }

  warn(context: string, message: string, ...data: unknown[]): void {
    console.warn(`[${context}] ${message}`, ...data);
  }

  // Placeholder for external error reporting (Sentry, Datadog, etc.)
  error(context: string, message: string, error?: unknown): void {
    console.error(`[${context}] ${message}`, error ?? '');
  }
}
