import { Component, computed, inject, output } from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AppStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideTrash2,
  LucidePencil,
  LucideImagePlus,
  LucideChevronsRight,
} from '@lucide/angular';
import { SinglePricePipe } from '@core';
import { PaginationAccumulatorService } from '@service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-book-table',
  imports: [
    CommonModule,
    ScrollingModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    TranslocoDirective,
    LucideTrash2,
    LucidePencil,
    LucideImagePlus,
    LucideChevronsRight,
    SinglePricePipe,
  ],
  templateUrl: './book-table.html',
  styleUrl: './book-table.css',
})
export class BookTable {
  appStore = inject(AppStore);
  edit = output<CreateProductDto>();
  remove = output<CreateProductDto>();
  editCover = output<CreateProductDto>();

  private accumulator = inject(PaginationAccumulatorService);

  // 🚀 Single line declaration for accumulated products!
  accumulatedProducts$ = this.accumulator.accumulate(
    this.appStore.productsResource,
    computed(() => this.appStore.filters().page),
    computed(() => this.appStore.appendMode()),
    (res) => res?.data ?? [],
  );

  trackByProductId(index: number, product: CreateProductDto): string | number {
    return product.id; // Assuming each product has a unique identifier
  }

  dynamicColumns = computed(() => {
    if (this.appStore.isBook()) {
      return {
        columnOne: 'book_table.publisher',
        columnTwo: 'book_table.isbn',
      };
    } else {
      return {
        columnOne: 'book_table.brand',
        columnTwo: 'book_table.category',
      };
    }
  });

  handleEdit(book: CreateProductDto) {
    this.edit.emit(book);
  }

  handleEditCover(book: CreateProductDto) {
    this.editCover.emit(book);
  }

  handleDelete(book: CreateProductDto) {
    this.remove.emit(book);
  }
}
