import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface GenerateLabelRequest {
  trackingCode: string;
  fullName: string;
  rut: string;
  email?: string;
  phone: string;
  region: string;
  ciudad: string;
  comuna: string;
  calle: string;
  numero: string;
  depto?: string;
  referencia?: string;
  itemCount: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ShipmentsService {
  constructor(private api: ApiService) {}

  generateLabel(body: GenerateLabelRequest): Observable<{ zpl: string }> {
    return this.api.post<{ zpl: string }>('/shipments/label', body);
  }
}
