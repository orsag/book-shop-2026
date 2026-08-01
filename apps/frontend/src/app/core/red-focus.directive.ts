import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  Renderer2,
} from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

@Directive({
  selector: '[appRedFocus]',
  standalone: true,
})
export class RedFocusDirective implements OnInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    this.focusMonitor.monitor(this.elementRef).subscribe((origin) => {
      if (origin === 'keyboard') {
        // Apply your red focus styles only for keyboard navigation
        this.renderer.addClass(this.elementRef.nativeElement, 'outline-none');
        this.renderer.addClass(this.elementRef.nativeElement, 'bg-red-500');
        this.renderer.addClass(this.elementRef.nativeElement, 'border-red-500');
        this.renderer.addClass(this.elementRef.nativeElement, 'text-white');
        this.renderer.addClass(this.elementRef.nativeElement, 'scale-105');
      } else {
        // Clear them immediately for mouse, touch, or blur
        this.removeStyles();
      }
    });
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  private removeStyles() {
    const el = this.elementRef.nativeElement;
    this.renderer.removeClass(el, 'outline-none');
    this.renderer.removeClass(el, 'bg-red-500');
    this.renderer.removeClass(el, 'border-red-500');
    this.renderer.removeClass(el, 'text-white');
    this.renderer.removeClass(el, 'scale-105');
  }
}
