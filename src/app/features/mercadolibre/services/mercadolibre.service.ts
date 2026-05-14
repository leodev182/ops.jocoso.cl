import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';

@Injectable({ providedIn: 'root' })
export class MercadolibreService {
  private readonly CONTEXT = 'MercadolibreService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  redirectToAuthorize(): void {
    this.logger.info(this.CONTEXT, 'Fetching ML OAuth URL');
    this.api.get<{ url: string }>('/ml/oauth/authorize').subscribe({
      next: ({ url }) => {
        window.location.href = url;
      },
      error: err => {
        this.logger.error(this.CONTEXT, 'Failed to get ML OAuth URL', err);
      },
    });
  }
}
