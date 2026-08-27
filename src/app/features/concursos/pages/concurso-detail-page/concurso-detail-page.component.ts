import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { catchError, of } from 'rxjs';
import { ConcursosService } from '../../services/concursos.service';
import { Concurso, Participante } from '../../../../core/models/concurso.model';
import { LoggerService } from '../../../../core/services/logger.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-concurso-detail-page',
  standalone: true,
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './concurso-detail-page.component.html',
  styleUrl: './concurso-detail-page.component.scss',
})
export class ConcursoDetailPageComponent implements OnInit {
  private readonly CONTEXT = 'ConcursoDetailPage';

  concurso: Concurso | null = null;
  participantes: Participante[] = [];
  loadError = '';
  actionError = '';
  isDrawing = false;
  isSyncing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ConcursosService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  private load(id: string): void {
    this.service.getById(id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error cargando concurso', err);
        this.loadError = 'No se pudo cargar el concurso.';
        return of(null);
      }),
    ).subscribe(c => {
      if (c) {
        this.concurso = c;
        this.loadParticipantes(id);
      }
    });
  }

  private loadParticipantes(id: string): void {
    this.service.getParticipantes(id).pipe(
      catchError(() => of([])),
    ).subscribe(p => this.participantes = p);
  }

  onDraw(): void {
    if (!this.concurso) return;
    if (!confirm('¿Ejecutar la ruleta? Se seleccionará un ganador al azar entre todos los participantes.')) return;
    this.isDrawing = true;
    this.actionError = '';
    this.service.draw(this.concurso.id).pipe(
      catchError(err => {
        this.actionError = err?.error?.message ?? 'Error al ejecutar la ruleta.';
        this.isDrawing = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res && this.concurso) {
        this.concurso = { ...this.concurso, ganadorOrdenId: res.ganadorOrdenId, resultadoVisible: true };
      }
      this.isDrawing = false;
    });
  }

  onSync(): void {
    if (!this.concurso) return;
    this.isSyncing = true;
    this.actionError = '';
    this.service.syncOrdenes(this.concurso.id).pipe(
      catchError(err => {
        this.actionError = err?.error?.message ?? 'Error al sincronizar.';
        this.isSyncing = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res !== null && this.concurso) this.loadParticipantes(this.concurso.id);
      this.isSyncing = false;
    });
  }

  get reglasUrl(): string { return `${environment.apiUrl}/concursos/${this.concurso?.id}/reglas`; }
  get legalesUrl(): string { return `${environment.apiUrl}/concursos/${this.concurso?.id}/legales`; }

  get ganadorParticipante(): Participante | null {
    if (!this.concurso?.ganadorOrdenId) return null;
    return this.participantes.find(p => p.ordenId === this.concurso!.ganadorOrdenId) ?? null;
  }

  formatCLP(amount: number): string {
    return amount.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  goBack(): void { this.router.navigate(['/concursos']); }
  goToEditar(): void { this.router.navigate(['/concursos', this.concurso?.id, 'editar']); }
}
