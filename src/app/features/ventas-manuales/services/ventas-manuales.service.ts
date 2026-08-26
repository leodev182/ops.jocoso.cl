import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface ClientResult {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface ManualOrderItem {
  variantId: string;
  quantity: number;
}

export type ManualOrderOrigin = 'CARD' | 'TRANSFER' | 'CASH';

export interface CreateManualOrderRequest {
  userId: string;
  items: ManualOrderItem[];
  origin: ManualOrderOrigin;
}

export interface ManualOrderResult {
  orderId: string;
  totalAmount: number;
}

@Injectable({ providedIn: 'root' })
export class VentasManualesService {
  constructor(private api: ApiService) {}

  searchClients(q: string): Observable<ClientResult[]> {
    return this.api.get<ClientResult[]>('/admin/clients/search', { q });
  }

  createClient(body: CreateClientRequest): Observable<ClientResult> {
    return this.api.post<ClientResult>('/admin/clients', body);
  }

  createOrder(body: CreateManualOrderRequest): Observable<ManualOrderResult> {
    return this.api.post<ManualOrderResult>('/admin/orders/manual', body);
  }
}
