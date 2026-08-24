import { Component, inject, input } from '@angular/core';
import { AppStore } from '@store';
import {
  LucideChevronLeft,
  LucideChevronsLeft,
  LucideChevronRight,
  LucideChevronsRight,
} from '@lucide/angular';
import { RedFocusDirective } from '@core';
import { LoadingService } from '../../core/loading.service';

@Component({
  selector: 'app-pagination',
  imports: [
    LucideChevronLeft,
    LucideChevronsLeft,
    LucideChevronRight,
    LucideChevronsRight,
    RedFocusDirective,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  store = inject(AppStore);
  loading = inject(LoadingService);

  // Number of items actually rendered (grows with infinite scroll / Load More)
  loadedCount = input(0);
}
