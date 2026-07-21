import { OnDestroy, inject, ViewEncapsulation, computed } from '@angular/core';
import { Component, input, signal, effect } from '@angular/core';
import { ConfigurationService } from '@service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [],
  template: `
    <div class="absolute top-0 left-0 w-full h-2 z-51 pointer-events-none">
      <progress
        class="progress progress-success w-full h-full block m-0 p-0"
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
        display: block;
        width: 100%;
        position: relative;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressComponent implements OnDestroy {
  showLoader = input<boolean>(false);
  config = inject(ConfigurationService);
  isDarkTheme = computed(() => this.config.theme() === 'dark');

  constructor() {
    // 2. React to the loader visibility
    effect(() => {
      if (this.showLoader()) {
        this.animateProgress(); // Start animation when loader appears
      } else {
        this.resetProgress(); // Reset when it disappears
      }
    });
  }

  animateProgress() {
    // Cancel any existing animation before starting a new one
    if (this.animationId) cancelAnimationFrame(this.animationId);

    const startTime = performance.now();
    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(100, (elapsed / 1000) * 100);

      this.progressValue.set(progress);

      if (progress < 100 && this.showLoader()) {
        this.animationId = requestAnimationFrame(updateProgress);
      }
    };

    this.animationId = requestAnimationFrame(updateProgress);
  }

  resetProgress() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.progressValue.set(0);
  }

  ngOnDestroy() {
    this.resetProgress();
  }

  readonly progressValue = signal<number>(0);
  private animationId: number | null = null;
}
