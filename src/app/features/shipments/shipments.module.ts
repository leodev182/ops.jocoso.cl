import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentsRoutingModule } from './shipments-routing.module';
import { EnviosPageComponent } from './pages/envios-page/envios-page.component';

@NgModule({
  imports: [
    CommonModule,
    ShipmentsRoutingModule,
    EnviosPageComponent,
  ],
})
export class ShipmentsModule {}
