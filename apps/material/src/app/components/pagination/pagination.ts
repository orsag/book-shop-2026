import { Component, inject, input } from '@angular/core';
import { AppStore } from '@store';
import {
  LucideChevronLeft,
  LucideChevronsLeft,
  LucideChevronRight,
  LucideChevronsRight,
} from '@lucide/angular';
import { LoadingService } from '@core';
import { ConfigurationService } from '@service';
import { MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pagination',
  imports: [
    LucideChevronLeft,
    LucideChevronsLeft,
    LucideChevronRight,
    LucideChevronsRight,
    MatIconButton,
    MatProgressSpinner,
  ],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  store = inject(AppStore);
  loading = inject(LoadingService);
  config = inject(ConfigurationService);

  loadedCount = input(0);
}