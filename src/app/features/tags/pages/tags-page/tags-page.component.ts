import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
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
      catchError(err => {
        this.logger.error(this.CONTEXT, 'Failed to delete tag', err);
        this.errorMessage = 'Error al eliminar el tag.';
        return of(null);
      }),
    ).subscribe(res => {
      if (res !== null) {
        this.tags = this.tags.filter(t => t.id !== tag.id);
      }
    });
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
