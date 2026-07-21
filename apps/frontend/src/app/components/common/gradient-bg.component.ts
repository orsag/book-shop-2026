import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  inject,
  ElementRef,
} from '@angular/core';
import { ConfigurationService } from '@service';

@Component({
  selector: 'app-gradient-bg',
  standalone: true,
  template: `
    <div class="gradient-bg" [class.is-dark-theme]="config.theme() === 'dark'">
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
export class GradientBgComponent implements OnInit, OnDestroy {
  config = inject(ConfigurationService);
  private ngZone = inject(NgZone);
  private hostRef = inject(ElementRef);

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.config.theme() === 'dark') return;

    const style = this.hostRef.nativeElement.style;
    style.setProperty('--mouse-x', `${event.clientX}px`);
    style.setProperty('--mouse-y', `${event.clientY}px`);
  };
}
