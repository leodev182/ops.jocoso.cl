import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConcursosRoutingModule } from './concursos-routing.module';
import { ConcursosListPageComponent } from './pages/concursos-list-page/concursos-list-page.component';
import { ConcursoFormPageComponent } from './pages/concurso-form-page/concurso-form-page.component';
import { ConcursoDetailPageComponent } from './pages/concurso-detail-page/concurso-detail-page.component';

@NgModule({
  imports: [
    CommonModule,
    ConcursosRoutingModule,
    ConcursosListPageComponent,
    ConcursoFormPageComponent,
    ConcursoDetailPageComponent,
  ],
})
export class ConcursosModule {}
