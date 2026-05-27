import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ShipmentsService, GenerateLabelRequest } from '../../services/shipments.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-envios-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './envios-page.component.html',
  styleUrl: './envios-page.component.scss',
})
export class EnviosPageComponent {
  private readonly CONTEXT = 'EnviosPage';

  form = {
    trackingCode: '',
    fullName: '',
    rut: '',
    email: '',
    phone: '',
    region: '',
    ciudad: '',
    comuna: '',
    calle: '',
    numero: '',
    depto: '',
    referencia: '',
    itemCount: null as number | null,
    total: null as number | null,
  };

  isLoading = false;
  zplResult = '';
  errorMessage = '';

  constructor(
    private shipments: ShipmentsService,
    private logger: LoggerService,
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.zplResult = '';
    this.errorMessage = '';

    const body: GenerateLabelRequest = {
      trackingCode: this.form.trackingCode || undefined,
      fullName: this.form.fullName,
      rut: this.form.rut,
      email: this.form.email || undefined,
      phone: this.form.phone,
      region: this.form.region,
      ciudad: this.form.ciudad,
      comuna: this.form.comuna,
      calle: this.form.calle,
      numero: this.form.numero,
      depto: this.form.depto || undefined,
      referencia: this.form.referencia || undefined,
      itemCount: this.form.itemCount ?? undefined,
      total: this.form.total ?? undefined,
    };

    this.shipments.generateLabel(body).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Error generating label', err);
        this.errorMessage = 'Error al generar la etiqueta. Revisa los datos e inténtalo de nuevo.';
        this.isLoading = false;
        return of(null);
      }),
    ).subscribe(res => {
      if (res) this.zplResult = res.zpl;
      this.isLoading = false;
    });
  }

  downloadZpl(): void {
    const blob = new Blob([this.zplResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `etiqueta-${this.form.trackingCode}.zpl`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
