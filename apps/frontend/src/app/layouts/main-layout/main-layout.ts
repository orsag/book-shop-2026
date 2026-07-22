import { Component, computed, inject } from '@angular/core';
import { BannerComponent, Filter, Footer, Navbar, Toast, ScrollBtn } from '@component';
import { ProgressComponent } from '@component';
import { RouterOutlet } from '@angular/router';
import { ConfigurationService } from '@service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of, delay } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppStore } from '@store';
import { DEFAULT_LOADER_DELAY } from '@store/libs';

@Component({
  selector: 'app-main-layout',
  imports: [
    BannerComponent,
    Filter,
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtn,
    ProgressComponent,
    Toast,
    CommonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  store = inject(AppStore);
  config = inject(ConfigurationService);

  readonly showLoader = toSignal(
    toObservable(this.store.isLoading).pipe(
      switchMap((isLoading) => {
        if (isLoading) {
          return of(true);
        } else {
          return of(false).pipe(delay(DEFAULT_LOADER_DELAY));
        }
      }),
    ),
    { initialValue: false },
  );

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
