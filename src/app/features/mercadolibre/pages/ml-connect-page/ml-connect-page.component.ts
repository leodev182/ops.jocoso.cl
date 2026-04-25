import { Component } from '@angular/core';
import { MercadolibreService } from '../../services/mercadolibre.service';

@Component({
  selector: 'app-ml-connect-page',
  standalone: true,
  imports: [],
  templateUrl: './ml-connect-page.component.html',
  styleUrl: './ml-connect-page.component.scss',
})
export class MlConnectPageComponent {
  constructor(private mlService: MercadolibreService) {}

  onConnect(): void {
    this.mlService.redirectToAuthorize();
  }
}
