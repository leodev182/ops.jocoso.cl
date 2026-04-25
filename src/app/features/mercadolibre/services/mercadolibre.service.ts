import { Injectable } from '@angular/core';
import { LoggerService } from '../../../core/services/logger.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MercadolibreService {
  private readonly CONTEXT = 'MercadolibreService';
  private readonly oauthUrl = `${environment.apiUrl}/ml/oauth/authorize`;

  constructor(private logger: LoggerService) {}

  // Triggers browser redirect — ML OAuth returns a 302, not handled by HttpClient
  redirectToAuthorize(): void {
    this.logger.info(this.CONTEXT, 'Redirecting to ML OAuth');
    window.location.href = this.oauthUrl;
  }
}
