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

  form: GenerateLabelRequest = {
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
    itemCount: 1,
    total: 0,
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
      ...this.form,
      email: this.form.email || undefined,
      depto: this.form.depto || undefined,
      referencia: this.form.referencia || undefined,
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
