import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { AdminUser } from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-list-page',
  standalone: true,
  imports: [],
  templateUrl: './users-list-page.component.html',
  styleUrl: './users-list-page.component.scss',
})
export class UsersListPageComponent implements OnInit {
  private readonly CONTEXT = 'UsersListPage';

  users: AdminUser[] = [];
  loadError = '';
  actionError = '';
  actingId: string | null = null;

  constructor(
    private usersService: UsersService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.usersService.getAll().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load users', err);
        this.loadError = 'No se pudieron cargar los usuarios.';
        return of([]);
      }),
    ).subscribe(users => { this.users = users; });
  }

  toggleBan(user: AdminUser): void {
    const verb = user.isActive ? 'banear' : 'reactivar';
    if (!confirm(`¿Seguro que quieres ${verb} a ${user.name || user.email}?`)) return;

    this.actingId = user.id;
    this.actionError = '';
    this.usersService.setActive(user.id, !user.isActive).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.actingId = null;
      },
      error: (err) => {
        this.logger.error(this.CONTEXT, 'Failed to set user status', err);
        this.actionError = err?.error?.message ?? 'No se pudo actualizar el usuario.';
        this.actingId = null;
      },
    });
  }
}
