import { Component, computed, inject, output } from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AppStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideTrash,
  LucidePencil,
  LucideImagePlus,
  LucideChevronsRight,
} from '@lucide/angular';
import { SinglePricePipe } from '@core';
import { PaginationAccumulatorService } from '@service';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-product-table',
  imports: [
    CommonModule,
    ScrollingModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    TranslocoDirective,
    LucideTrash,
    LucidePencil,
    LucideImagePlus,
    LucideChevronsRight,
    SinglePricePipe,
  ],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css',
})
export class ProductTable {
  appStore = inject(AppStore);
  edit = output<CreateProductDto>();
  remove = output<CreateProductDto>();
  editCover = output<CreateProductDto>();

  private accumulator = inject(PaginationAccumulatorService);

  // 🚀 Single line declaration for accumulated products!
  accumulatedProducts$ = this.accumulator.accumulate(
    this.appStore.productsResource,
    computed(() => ({
      page: this.appStore.filters().page,
      append: this.appStore.appendMode(),
    })),
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
