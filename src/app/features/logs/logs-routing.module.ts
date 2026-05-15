import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogsPageComponent } from './pages/logs-page/logs-page.component';

const routes: Routes = [
  { path: '', component: LogsPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogsRoutingModule {}
