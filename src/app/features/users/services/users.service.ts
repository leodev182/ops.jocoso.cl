import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { LoggerService } from '../../../core/services/logger.service';
import { AdminUser } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly CONTEXT = 'UsersService';

  constructor(
    private api: ApiService,
    private logger: LoggerService,
  ) {}

  getAll(): Observable<AdminUser[]> {
    this.logger.debug(this.CONTEXT, 'Loading users');
    return this.api.get<{ data: AdminUser[] }>('/admin/users').pipe(map(res => res.data));
  }

  // Banear (isActive=false) o reactivar (isActive=true) — soft delete
  setActive(id: string, isActive: boolean): Observable<void> {
    this.logger.debug(this.CONTEXT, `Set user ${id} active=${isActive}`);
    return this.api.patch<void>(`/admin/users/${id}/status`, { isActive });
  }
}
