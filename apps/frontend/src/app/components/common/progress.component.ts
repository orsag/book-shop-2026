import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  signal,
  effect,
  PLATFORM_ID,
  DestroyRef,
} from '@angular/core';
import { ConfigurationService } from '@service';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../../core/loading.service';
import { DEFAULT_LOADER_DELAY } from '@store/libs';

/**
 * Global HTTP progress bar.
 *
 * Self-contained: listens to LoadingService (fed by loadingInterceptor),
 * shows IMMEDIATELY when any tracked request starts and hides after a short
 * delay so fast requests don't flicker. The element is ALWAYS rendered -
 * visibility is CSS-toggled (opacity/visibility), which avoids @if churn and
 * lets the browser transition smoothly.
 *
 * Place once per layout root: <app-progress />
 */
@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [],
  template: `
    <div
      class="fixed top-0 left-0 w-full h-2 z-[60] pointer-events-none transition-all duration-300"
      [class.invisible]="!visible()"
      [class.opacity-0]="!visible()"
    >
      <div class="w-full h-full bg-base-100/80 backdrop-blur-sm"></div>
      <progress
        class="progress progress-success absolute top-0 left-0 w-full h-full block m-0 p-0"
        [class.progress-success]="!isDarkTheme()"
        [class.progress-primary]="isDarkTheme()"
        [value]="progressValue()"
        max="100"
      ></progress>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressComponent {
  config = inject(ConfigurationService);
  private loading = inject(LoadingService);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Overridable for tests. */
  loaderDelay = DEFAULT_LOADER_DELAY;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  isDarkTheme = computed(() => this.config.isDarkTheme());

  /** CSS-driven visibility of the whole strip. */
  readonly visible = signal(false);

  readonly progressValue = signal<number>(0);
  private animationId: number | null = null;

  constructor() {
    effect(() => {
      // Track the global counter map through the computed selector
      if (this.loading.isGlobalLoading()) {
        this.cancelHideTimer();
        this.visible.set(true);
        this.animateProgress(); // restart fill from 0 on each new burst
      } else {
        // Delay hiding so quick requests don't cause a flicker
        this.cancelHideTimer();
        this.hideTimer = setTimeout(() => {
          this.visible.set(false);
          this.resetProgress();
        }, this.loaderDelay);
      }
    });

    // Never leak a pending timer or animation frame
    this.destroyRef.onDestroy(() => {
      this.cancelHideTimer();
      this.cancelAnimation();
    });
  }

  private animateProgress() {
    if (!this.isBrowser) return;
    this.cancelAnimation();

    const startTime = performance.now();
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(100, (elapsed / 1000) * 100);

      this.progressValue.set(progress);

      if (progress < 100 && this.visible()) {
        this.animationId = requestAnimationFrame(updateProgress);
      }
    };

    this.animationId = requestAnimationFrame(updateProgress);
  }

  private resetProgress() {
    this.cancelAnimation();
    this.progressValue.set(0);
  }

  private cancelAnimation() {
    if (this.isBrowser && this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private cancelHideTimer() {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
