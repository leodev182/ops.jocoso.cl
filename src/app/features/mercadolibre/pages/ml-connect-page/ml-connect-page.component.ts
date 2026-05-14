import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MercadolibreService } from '../../services/mercadolibre.service';

@Component({
  selector: 'app-ml-connect-page',
  standalone: true,
  imports: [],
  templateUrl: './ml-connect-page.component.html',
  styleUrl: './ml-connect-page.component.scss',
})
export class MlConnectPageComponent implements OnInit {
  connected = false;
  sellerId = '';

  constructor(
    private mlService: MercadolibreService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.connected = this.route.snapshot.queryParamMap.get('connected') === 'true';
    this.sellerId = this.route.snapshot.queryParamMap.get('sellerId') ?? '';
  }

  onConnect(): void {
    this.mlService.redirectToAuthorize();
  }
}
