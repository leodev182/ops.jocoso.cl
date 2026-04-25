import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersListPageComponent } from './pages/orders-list-page/orders-list-page.component';
import { OrderDetailPageComponent } from './pages/order-detail-page/order-detail-page.component';
import { OrdersTableComponent } from './components/orders-table/orders-table.component';

@NgModule({
  imports: [
    CommonModule,
    OrdersRoutingModule,
    OrdersListPageComponent,
    OrderDetailPageComponent,
    OrdersTableComponent,
  ],
})
export class OrdersModule {}
