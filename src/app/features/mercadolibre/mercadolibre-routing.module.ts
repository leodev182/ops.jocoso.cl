import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MlConnectPageComponent } from './pages/ml-connect-page/ml-connect-page.component';

const routes: Routes = [{ path: '', component: MlConnectPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MercadolibreRoutingModule {}
