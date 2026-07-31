import { Component, inject } from '@angular/core';
import { AppStore } from '@store';
import {
  LucideChevronLeft,
  LucideChevronsLeft,
  LucideChevronRight,
  LucideChevronsRight,
  LucideChevronDown,
} from '@lucide/angular';
import { RedFocusDirective } from '../../core/red-focus.directive';

@Component({
  selector: 'app-pagination',
  imports: [
    LucideChevronLeft,
    LucideChevronsLeft,
    LucideChevronRight,
    LucideChevronsRight,
    LucideChevronDown,
    RedFocusDirective,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  store = inject(AppStore);
}
