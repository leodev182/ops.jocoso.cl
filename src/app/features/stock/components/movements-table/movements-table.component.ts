import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StockMovement } from '../../../../core/models/stock.model';

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './movements-table.component.html',
  styleUrl: './movements-table.component.scss',
})
export class MovementsTableComponent {
  @Input() movements: StockMovement[] = [];
}
