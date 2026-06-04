import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersRoutingModule } from './users-routing.module';
import { UsersListPageComponent } from './pages/users-list-page/users-list-page.component';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    UsersListPageComponent,
  ],
})
export class UsersModule {}
