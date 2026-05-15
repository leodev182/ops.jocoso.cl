import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LogsService, LogEntry } from '../../services/logs.service';

@Component({
  selector: 'app-logs-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './logs-page.component.html',
  styleUrl: './logs-page.component.scss',
})
export class LogsPageComponent implements OnInit, OnDestroy {
  entries: LogEntry[] = [];
  isLoading = false;
  errorMsg = '';
  searchTerm = '';
  selectedLevel = 0;
  autoRefresh = false;

  private refreshSub?: Subscription;

  readonly levelOptions = [
    { value: 0,  label: 'Todos los niveles' },
    { value: 30, label: 'INFO' },
    { value: 40, label: 'WARN' },
    { value: 50, label: 'ERROR' },
  ];

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  load(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.logsService.getLogs(
      this.selectedLevel || undefined,
      this.searchTerm || undefined,
    ).pipe(
      catchError(() => {
        this.errorMsg = 'Error al cargar los logs.';
        this.isLoading = false;
        return of([]);
      }),
    ).subscribe(data => {
      this.entries = data;
      this.isLoading = false;
    });
  }

  onToggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.refreshSub = interval(5000).pipe(
        switchMap(() => this.logsService.getLogs(
          this.selectedLevel || undefined,
          this.searchTerm || undefined,
        ).pipe(catchError(() => of([])))),
      ).subscribe(data => { this.entries = data; });
    } else {
      this.refreshSub?.unsubscribe();
    }
  }

  levelLabel(level: number): string {
    if (level >= 60) return 'FATAL';
    if (level >= 50) return 'ERROR';
    if (level >= 40) return 'WARN';
    if (level >= 30) return 'INFO';
    return 'DEBUG';
  }

  levelClass(level: number): string {
    if (level >= 60) return 'badge--fatal';
    if (level >= 50) return 'badge--error';
    if (level >= 40) return 'badge--warn';
    return 'badge--info';
  }

  messageFor(e: LogEntry): string {
    if (e.req) return `${e.req.method} ${e.req.url}${e.res ? ' → ' + e.res.statusCode : ''}`;
    if (e.err) return `${e.msg}: ${e.err}`;
    return e.msg;
  }

  timeAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'hace menos de 1 min';
    const m = Math.floor(s / 60);
    if (m < 60) return `hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.floor(h / 24)} días`;
  }
}
