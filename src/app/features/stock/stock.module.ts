import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockRoutingModule } from './stock-routing.module';
import { StockPageComponent } from './pages/stock-page/stock-page.component';
import { MovementsTableComponent } from './components/movements-table/movements-table.component';

@NgModule({
  imports: [
    CommonModule,
    StockRoutingModule,
    StockPageComponent,
    MovementsTableComponent,
  ],
})
export class StockModule {}
