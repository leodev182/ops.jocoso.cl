import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ConcursosService } from '../../services/concursos.service';
import { Concurso, ConcursoEstado } from '../../../../core/models/concurso.model';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-concursos-list-page',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './concursos-list-page.component.html',
  styleUrl: './concursos-list-page.component.scss',
})
export class ConcursosListPageComponent implements OnInit {
  private readonly CONTEXT = 'ConcursosListPage';

  concursos: Concurso[] = [];
  loadError = '';
  actionError = '';
  loadingId = '';

  constructor(
    private service: ConcursosService,
    private router: Router,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.service.getAll().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error cargando concursos', err);
        this.loadError = 'No se pudieron cargar los concursos.';
        return of([]);
      }),
    ).subscribe(data => this.concursos = data);
  }

  goToNuevo(): void { this.router.navigate(['/concursos/nuevo']); }
  goToEditar(id: string): void { this.router.navigate(['/concursos', id, 'editar']); }
  goToDetalle(id: string): void { this.router.navigate(['/concursos', id]); }

  activar(c: Concurso): void { this.cambiarEstado(c.id, 'ACTIVE'); }
  finalizar(c: Concurso): void {
    if (!confirm(`¿Finalizar el concurso "${c.titulo}"? No se podrá reactivar.`)) return;
    this.cambiarEstado(c.id, 'FINISHED');
  }

  private cambiarEstado(id: string, estado: ConcursoEstado): void {
    this.loadingId = id;
    this.actionError = '';
    this.service.cambiarEstado(id, estado).pipe(
      catchError(err => {
        this.actionError = err?.error?.message ?? 'Error al cambiar estado.';
        this.loadingId = '';
        return of(null);
      }),
    ).subscribe(res => {
      if (res !== undefined) this.load();
      this.loadingId = '';
    });
  }

  formatCLP(amount: number): string {
    return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }
}
