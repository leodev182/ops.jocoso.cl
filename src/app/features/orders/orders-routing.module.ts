import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrdersListPageComponent } from './pages/orders-list-page/orders-list-page.component';
import { OrderDetailPageComponent } from './pages/order-detail-page/order-detail-page.component';

const routes: Routes = [
  { path: '', component: OrdersListPageComponent },
  { path: ':id', component: OrderDetailPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdersRoutingModule {}
