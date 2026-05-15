import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';

export interface LogEntry {
  level: number;
  time: number;
  context?: string;
  msg: string;
  err?: string;
  req?: { method: string; url: string };
  res?: { statusCode: number };
}

@Injectable({ providedIn: 'root' })
export class LogsService {
  constructor(private api: ApiService) {}

  getLogs(level?: number, search?: string, limit = 200): Observable<LogEntry[]> {
    const params: Record<string, string> = { limit: String(limit) };
    if (level) params['level'] = String(level);
    if (search) params['search'] = search;
    return this.api.get<{ data: LogEntry[] }>('/admin/logs', params).pipe(map(r => r.data));
  }
}
