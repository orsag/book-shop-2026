import { Component, computed, inject, output, Signal } from '@angular/core';
import { CreateProductDto } from '@api';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AppStore } from '@store';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  LucideTrash2,
  LucidePencil,
  LucideImagePlus,
  LucideChevronsRight,
} from '@lucide/angular';
import { SinglePricePipe } from '@core';

@Component({
  selector: 'app-book-table',
  imports: [
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
  store = inject(AppStore);
  edit = output<CreateProductDto>();
  remove = output<CreateProductDto>();
  editCover = output<CreateProductDto>();

  products: Signal<CreateProductDto[]> = this.store.products;

  dynamicColumns = computed(() => {
    if (this.store.isBook()) {
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
