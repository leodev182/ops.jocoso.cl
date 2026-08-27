import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConcursosListPageComponent } from './pages/concursos-list-page/concursos-list-page.component';
import { ConcursoFormPageComponent } from './pages/concurso-form-page/concurso-form-page.component';
import { ConcursoDetailPageComponent } from './pages/concurso-detail-page/concurso-detail-page.component';

const routes: Routes = [
  { path: '', component: ConcursosListPageComponent },
  { path: 'nuevo', component: ConcursoFormPageComponent },
  { path: ':id', component: ConcursoDetailPageComponent },
  { path: ':id/editar', component: ConcursoFormPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConcursosRoutingModule {}
