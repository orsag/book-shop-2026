import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  OnDestroy,
  viewChild,
  effect,
  inject,
} from '@angular/core';
import { ConfigurationService } from '../../services/configuration-service';

@Component({
  selector: 'app-gradient-bg',
  standalone: true,
  template: `
    <div class="gradient-bg" [class.is-dark-theme]="config.theme() === 'dark'">
      <svg xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        class="gradients-container"
        style="filter: url(#goo); width: 100%; height: 100%;"
      >
        <div class="g1"></div>
        <div class="g2"></div>
        <div class="g3"></div>
        <div class="g4"></div>
        <div class="g5"></div>
        <div #interactive class="interactive"></div>
      </div>
    </div>
  `,
  styleUrls: ['./gradient2-bg.component.scss'],
})
export class GradientBgComponent implements OnInit, OnDestroy {
  config = inject(ConfigurationService);

  // Gracefully grab the local template reference instead of checking global document scope
  private interactiveEl = viewChild<ElementRef<HTMLDivElement>>('interactive');

  private curX = 0;
  private curY = 0;
  private tgX = 0;
  private tgY = 0;
  private animationFrameId?: number;

  constructor(private ngZone: NgZone) {
    // Keep an eye out for when the element binds to the DOM view graph
    effect(() => {
      const isDark = this.config.theme() === 'dark';
      const el = this.interactiveEl()?.nativeElement;

      if (isDark || !el) {
        this.stopAnimationLoop();
      } else {
        this.startAnimationLoop(el);
      }
    });
  }

  private stopAnimationLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined; // Reset variable state
    }
  }

  ngOnInit(): void {
    // Run mouse tracking outside change detection to avoid throttling interface performance
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    this.stopAnimationLoop(); // Clean up memory safely
  }

  private isLoopRunning = false;

  private onMouseMove = (event: MouseEvent): void => {
    if (this.config.theme() === 'dark') return;

    this.tgX = event.clientX;
    this.tgY = event.clientY;

    // 🟢 Wake the loop up only when the mouse actually moves
    if (!this.isLoopRunning) {
      this.startAnimationLoop(this.interactiveEl()?.nativeElement);
    }
  };

  private startAnimationLoop(element: HTMLDivElement | undefined): void {
    // Prevent duplicate loops from accidentally starting
    if (this.animationFrameId) return;

    if (!element || this.isLoopRunning) return;
    this.isLoopRunning = true;

    const move = () => {
      const deltaX = this.tgX - this.curX;
      const deltaY = this.tgY - this.curY;

      // 🟢 If the blob is basically touching your cursor, stop the loop to save CPU!
      if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) {
        this.isLoopRunning = false;
        this.animationFrameId = undefined;
        return;
      }

      // Linear interpolation math for easing
      this.curX += deltaX / 20;
      this.curY += deltaY / 20;

      element.style.transform = `translate3d(${Math.round(this.curX)}px, ${Math.round(this.curY)}px, 0)`;

      this.animationFrameId = requestAnimationFrame(move);
    };

    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(move);
    });
  }

  // private startAnimationLoop(element: HTMLDivElement): void {
  //   // Prevent duplicate loops from accidentally starting
  //   if (this.animationFrameId) return;
  //
  //   const move = () => {
  //     // Linear interpolation math for easing
  //     this.curX += (this.tgX - this.curX) / 20;
  //     this.curY += (this.tgY - this.curY) / 20;
  //
  //     element.style.transform = `translate(${Math.round(this.curX)}px, ${Math.round(this.curY)}px)`;
  //
  //     // Keep loop running smoothly
  //     this.animationFrameId = requestAnimationFrame(move);
  //   };
  //
  //   this.ngZone.runOutsideAngular(() => {
  //     this.animationFrameId = requestAnimationFrame(move);
  //   });
  // }
}
