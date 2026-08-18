import {
  Component,
  NgZone,
  inject,
  ElementRef,
  afterNextRender,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ConfigurationService } from '@service';

@Component({
  selector: 'app-gradient-bg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gradient-bg" [class.is-dark-theme]="config.isDarkTheme()">
      <svg xmlns="http://www.w3.org/2000/svg" class="goo-svg">
        <defs>
          <filter id="goo" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 14 -5"
              result="goo"
            />
          </filter>
        </defs>
      </svg>
      <!-- <svg xmlns="http://www.w3.org/2000/svg" class="goo-svg">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="12"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg> -->

      <div class="gradients-container">
        <div class="g1"></div>
        <div class="g2"></div>
        <div class="g3"></div>
        <div class="g4"></div>
        <div class="g5"></div>
        <div class="interactive"></div>
      </div>
    </div>
  `,
  styleUrls: ['./gradient-bg.component.scss'],
})
export class GradientBgComponent {
  config = inject(ConfigurationService);
  private ngZone = inject(NgZone);
  private hostRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      this.ngZone.runOutsideAngular(() => {
        window.addEventListener('mousemove', this.onMouseMove, {
          passive: true,
        });
      });

      // 2. Register cleanup specifically for when this client-side component destroys
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('mousemove', this.onMouseMove);
      });
    });
  }

  private onMouseMove = (event: MouseEvent): void => {
    const style = this.hostRef.nativeElement.style;
    style.setProperty('--mouse-x', `${event.clientX}px`);
    style.setProperty('--mouse-y', `${event.clientY}px`);
  };
}
