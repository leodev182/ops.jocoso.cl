import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, EMPTY, finalize, of, tap } from 'rxjs';
import { ProductsService } from '../../../products/services/products.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Tag } from '../../../../core/models/product.model';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tags-page.component.html',
  styleUrl: './tags-page.component.scss',
})
export class TagsPageComponent implements OnInit {
  private readonly CONTEXT = 'TagsPage';

  tags: Tag[] = [];
  isLoading = false;
  errorMessage = '';

  newName = '';
  newColor = '#e0e7ff';
  isCreating = false;
  createError = '';

  constructor(
    private productsService: ProductsService,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.loadTags();
  }

  onCreateTag(): void {
    if (!this.newName.trim()) return;
    this.isCreating = true;
    this.createError = '';

    this.productsService.createTag(this.newName.trim(), this.newColor).pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to create tag', err);
        this.createError = err?.error?.message ?? 'Error al crear el tag.';
        this.isCreating = false;
        return of(null);
      }),
    ).subscribe(tag => {
      if (tag) {
        this.tags = [...this.tags, tag].sort((a, b) => a.name.localeCompare(b.name));
        this.newName = '';
        this.newColor = '#e0e7ff';
      }
      this.isCreating = false;
    });
  }

  onDeleteTag(tag: Tag): void {
    if (!confirm(`¿Eliminar el tag "${tag.name}"? Se quitará de todos los productos.`)) return;

    this.productsService.deleteTag(tag.id).pipe(
      tap(() => this.tags = this.tags.filter(t => t.id !== tag.id)),
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to delete tag', err);
        this.errorMessage = 'Error al eliminar el tag.';
        return EMPTY;
      }),
    ).subscribe();
  }

  tagTextColor(hexColor: string | null): string {
    if (!hexColor) return '#1a1a2e';
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6) return '#1a1a2e';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
  }

  private loadTags(): void {
    this.isLoading = true;
    this.productsService.getTags().pipe(
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to load tags', err);
        this.errorMessage = 'Error al cargar los tags.';
        return of([]);
      }),
    ).subscribe(tags => {
      this.tags = tags;
      this.isLoading = false;
    });
  }
}
