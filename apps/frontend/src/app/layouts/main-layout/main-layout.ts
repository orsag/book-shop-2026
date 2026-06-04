import { Component, computed, inject } from '@angular/core';
import { BannerComponent } from '../../components/banner/banner';
import { Filter } from '../../components/filter/filter';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';
import { RouterOutlet } from '@angular/router';
import { ScrollBtnComponent } from '../../components/common/scrollToTop';
import { ToastComponent } from '../../components/common/toastComponent';
import { ConfigurationService } from '../../services/configuration-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { timer, switchMap, of, delay } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppStore } from '../../store/app-store';
import { ProgressComponent } from '../../components/common/progress.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    BannerComponent,
    Filter,
    Footer,
    Navbar,
    RouterOutlet,
    ScrollBtnComponent,
    ProgressComponent,
    ToastComponent,
    CommonModule,
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  store = inject(AppStore);
  private config = inject(ConfigurationService);

  readonly showLoader = toSignal(
    toObservable(this.store.isLoading).pipe(
      switchMap((isLoading) => {
        if (isLoading) {
          return of(true);
        } else {
          return of(false).pipe(delay(1000)); // 1s
        }
      }),
    ),
    { initialValue: false },
  );

  showFilter = computed(() => this.config.flags().SHOW_FILTER);
  showBanner = computed(() => this.config.flags().SHOW_DISCOUNT_BANNER);
}
