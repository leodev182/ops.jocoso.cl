import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockPageComponent } from './pages/stock-page/stock-page.component';
import { StockOverviewPageComponent } from './pages/stock-overview-page/stock-overview-page.component';

const routes: Routes = [
  { path: '', component: StockOverviewPageComponent },
  { path: ':variantId', component: StockPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StockRoutingModule {}
