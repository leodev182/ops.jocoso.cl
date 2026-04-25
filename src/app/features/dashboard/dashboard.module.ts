import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { TrendingTableComponent } from './components/trending-table/trending-table.component';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    DashboardPageComponent,
    TrendingTableComponent,
  ],
})
export class DashboardModule {}
