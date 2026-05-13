import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppStore } from '../../store/app-store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  imports: [CommonModule, RouterLink, TranslocoPipe],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class BannerComponent {
  store = inject(AppStore);

  // 1. Compute the gradient style
  readonly gradientStyle = computed(() => {
    if (this.store.isBook()) {
      return 'linear-gradient(to bottom right, #fee2e2, #fbcfe8, #ddd6fe)';
    }
    if (this.store.isGame()) {
      return 'linear-gradient(to bottom right, #6d28d9, #4c1d95, #a855f7)';
    }
    if (this.store.isGastro()) {
      return 'linear-gradient(to bottom right, #a7f3d0, #ccfbf1, #99f6e4)';
    }
    return 'transparent';
  });

  // 2. Compute the text color class
  readonly textColorClass = computed(() => {
    if (this.store.isBook()) return 'text-purple-900';
    if (this.store.isGame()) return 'text-white';
    if (this.store.isGastro()) return 'text-emerald-900';
    return '';
  });
}
