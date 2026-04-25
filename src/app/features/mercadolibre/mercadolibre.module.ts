import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MercadolibreRoutingModule } from './mercadolibre-routing.module';
import { MlConnectPageComponent } from './pages/ml-connect-page/ml-connect-page.component';

@NgModule({
  imports: [CommonModule, MercadolibreRoutingModule, MlConnectPageComponent],
})
export class MercadolibreModule {}
