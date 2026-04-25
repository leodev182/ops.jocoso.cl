import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsListPageComponent } from './pages/products-list-page/products-list-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page/product-detail-page.component';
import { ProductTableComponent } from './components/product-table/product-table.component';
import { VariantFormComponent } from './components/variant-form/variant-form.component';

@NgModule({
  imports: [
    CommonModule,
    ProductsRoutingModule,
    ProductsListPageComponent,
    ProductDetailPageComponent,
    ProductTableComponent,
    VariantFormComponent,
  ],
})
export class ProductsModule {}
