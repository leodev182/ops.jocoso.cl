import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, Observable } from 'rxjs';
import { ConcursosService } from '../../services/concursos.service';
import { Concurso } from '../../../../core/models/concurso.model';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-concurso-form-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './concurso-form-page.component.html',
  styleUrl: './concurso-form-page.component.scss',
})
export class ConcursoFormPageComponent implements OnInit {
  private readonly CONTEXT = 'ConcursoFormPage';
  private editId: string | null = null;

  isEdit = false;
  isLoading = false;
  isSaving = false;
  isUploadingImagen = false;
  errorMessage = '';

  form = {
    titulo: '',
    montoMinimo: null as number | null,
    fechaDesde: '',
    fechaHasta: '',
    reglas: '',
    legal: '',
    imagenPromoUrl: '',
    imagenPromoActiva: false,
    permiteMultiplesParticipaciones: true,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ConcursosService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.editId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.editId;
    if (this.isEdit && this.editId) this.loadConcurso(this.editId);
  }

  private loadConcurso(id: string): void {
    this.isLoading = true;
    this.service.getById(id).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error cargando concurso', err);
        this.errorMessage = 'No se pudo cargar el concurso.';
        this.isLoading = false;
        return of(null);
      }),
    ).subscribe(c => {
      if (c) {
        this.form.titulo = c.titulo;
        this.form.montoMinimo = c.montoMinimo;
        this.form.fechaDesde = c.fechaDesde.slice(0, 10);
        this.form.fechaHasta = c.fechaHasta ? c.fechaHasta.slice(0, 10) : '';
        this.form.reglas = c.reglas;
        this.form.legal = c.legal;
        this.form.imagenPromoUrl = c.imagenPromoUrl ?? '';
        this.form.imagenPromoActiva = c.imagenPromoActiva;
        this.form.permiteMultiplesParticipaciones = c.permiteMultiplesParticipaciones;
      }
      this.isLoading = false;
    });
  }

  onImagenChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.isUploadingImagen = true;
    this.service.uploadImagen(file).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error subiendo imagen', err);
        this.errorMessage = 'Error al subir la imagen.';
        this.isUploadingImagen = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res) this.form.imagenPromoUrl = res.url;
      this.isUploadingImagen = false;
    });
  }

  clearImagen(): void { this.form.imagenPromoUrl = ''; }

  onSubmit(): void {
    if (!this.form.titulo || !this.form.montoMinimo || !this.form.fechaDesde || !this.form.reglas || !this.form.legal) return;
    this.isSaving = true;
    this.errorMessage = '';

    const body = {
      titulo: this.form.titulo,
      montoMinimo: this.form.montoMinimo,
      fechaDesde: this.form.fechaDesde,
      fechaHasta: this.form.fechaHasta || undefined,
      reglas: this.form.reglas,
      legal: this.form.legal,
      imagenPromoUrl: this.form.imagenPromoUrl || undefined,
      imagenPromoActiva: this.form.imagenPromoActiva,
      permiteMultiplesParticipaciones: this.form.permiteMultiplesParticipaciones,
    };

    const op: Observable<unknown> = this.isEdit && this.editId
      ? this.service.update(this.editId, body)
      : this.service.create(body);

    op.pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error guardando concurso', err);
        this.errorMessage = err?.error?.message ?? 'Error al guardar.';
        this.isSaving = false;
        return of(null);
      }),
    ).subscribe(() => {
      this.router.navigate(['/concursos']);
      this.isSaving = false;
    });
  }

  goBack(): void { this.router.navigate(['/concursos']); }
}
