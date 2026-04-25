import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsListPageComponent } from './pages/products-list-page/products-list-page.component';
import { ProductDetailPageComponent } from './pages/product-detail-page/product-detail-page.component';

const routes: Routes = [
  { path: '', component: ProductsListPageComponent },
  { path: ':id', component: ProductDetailPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
