import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasManualesPageComponent } from './pages/ventas-manuales-page/ventas-manuales-page.component';

const routes: Routes = [
  { path: '', component: VentasManualesPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VentasManualesRoutingModule {}
