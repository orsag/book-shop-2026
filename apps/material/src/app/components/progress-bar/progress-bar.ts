import { Component, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip, of, switchMap, delay } from 'rxjs';
import { LoadingService } from '@core';
import { DEFAULT_LOADER_DELAY } from '@store/libs';
import { MatProgressBar } from '@angular/material/progress-bar';

/**
 * Global HTTP progress bar.
 *
 * Listens to LoadingService (fed by the loadingInterceptor): shows
 * IMMEDIATELY when any tracked request starts and hides after a short delay
 * so fast requests don't flicker. The element is ALWAYS rendered - visibility
 * is CSS-toggled (opacity), which avoids @if churn and lets the browser
 * transition smoothly.
 *
 * Place once per layout root: <app-progress-bar />
 */
@Component({
  selector: 'app-progress-bar',
  imports: [MatProgressBar],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class ProgressBarComponent {
  private loading = inject(LoadingService);

  /** Overridable for tests. */
  loaderDelay = DEFAULT_LOADER_DELAY;

  private readonly visible = signal(false);
  readonly isVisible = this.visible.asReadonly();

  constructor() {
    toObservable(this.loading.isGlobalLoading)
      .pipe(
        // Skip the initial snapshot; only react to actual transitions.
        skip(1),
        // Show immediately; delay the hide so quick requests don't flicker.
        // A new request during the wait cancels the pending hide via switchMap.
        switchMap((loading) =>
          loading ? of(true) : of(false).pipe(delay(this.loaderDelay)),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((show) => this.visible.set(show));
  }
}