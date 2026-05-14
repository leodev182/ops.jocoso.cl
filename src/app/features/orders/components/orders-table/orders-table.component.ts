import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe, LowerCasePipe, SlicePipe } from '@angular/common';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [DatePipe, LowerCasePipe, SlicePipe],
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.scss',
})
export class OrdersTableComponent {
  @Input() orders: Order[] = [];
  @Output() orderClick = new EventEmitter<Order>();
}
