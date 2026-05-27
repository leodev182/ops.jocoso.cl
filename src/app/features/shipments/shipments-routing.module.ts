import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnviosPageComponent } from './pages/envios-page/envios-page.component';

const routes: Routes = [
  { path: '', component: EnviosPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShipmentsRoutingModule {}
