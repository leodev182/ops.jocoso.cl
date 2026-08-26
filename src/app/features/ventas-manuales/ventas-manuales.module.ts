import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentasManualesRoutingModule } from './ventas-manuales-routing.module';
import { VentasManualesPageComponent } from './pages/ventas-manuales-page/ventas-manuales-page.component';

@NgModule({
  imports: [
    CommonModule,
    VentasManualesRoutingModule,
    VentasManualesPageComponent,
  ],
})
export class VentasManualesModule {}
