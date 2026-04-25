import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { TrendingProduct } from '../../../../core/models/product.model';

@Component({
  selector: 'app-trending-table',
  standalone: true,
  imports: [RouterLink, LowerCasePipe],
  templateUrl: './trending-table.component.html',
  styleUrl: './trending-table.component.scss',
})
export class TrendingTableComponent {
  @Input() products: TrendingProduct[] = [];
}
