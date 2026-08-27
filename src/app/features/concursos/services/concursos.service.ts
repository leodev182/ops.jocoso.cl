import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Concurso, CreateConcursoRequest, Participante, ConcursoEstado } from '../../../core/models/concurso.model';
import { environment } from '../../../../environments/environment';
// HttpClient interceptor agrega el token automáticamente

@Injectable({ providedIn: 'root' })
export class ConcursosService {
  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {}

  getAll(): Observable<Concurso[]> {
    return this.api.get<Concurso[]>('/concursos', { admin: 'true' });
  }

  getById(id: string): Observable<Concurso> {
    return this.api.get<Concurso>(`/concursos/${id}`);
  }

  create(body: CreateConcursoRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/concursos', body);
  }

  update(id: string, body: Partial<CreateConcursoRequest>): Observable<void> {
    return this.api.patch<void>(`/concursos/${id}`, body);
  }

  cambiarEstado(id: string, estado: ConcursoEstado): Observable<void> {
    return this.api.patch<void>(`/concursos/${id}/estado`, { estado });
  }

  draw(id: string, fallbackNombre?: string): Observable<{ ganadorOrdenId: string | null; ganadorFallbackNombre: string | null; esFallback: boolean }> {
    return this.api.post(`/concursos/${id}/draw`, fallbackNombre ? { fallbackNombre } : {});
  }

  getParticipantes(id: string): Observable<Participante[]> {
    return this.api.get<Participante[]>(`/concursos/${id}/participantes`);
  }

  syncOrdenes(id: string): Observable<{ created: number }> {
    return this.api.post<{ created: number }>(`/concursos/${id}/sync-ordenes`, {});
  }

  uploadImagen(file: File): Observable<{ url: string; publicId: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'jocoso/concursos');
    return this.http.post<{ url: string; publicId: string }>(`${environment.apiUrl}/images/upload`, form);
  }
}
