import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  Renderer2,
  HostListener,
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

  // Intercept Enter or Space key presses when focused via keyboard
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent default page scroll on Space

      const el = this.elementRef.nativeElement;

      // If it's a collapse title, find and check its associated radio input
      const collapseItem = el.closest('.collapse');
      if (collapseItem) {
        const radioInput = collapseItem.querySelector(
          'input[type="radio"]',
        ) as HTMLInputElement;
        if (radioInput) {
          radioInput.checked = true;
          // Dispatch a change event so Angular/DaisyUI picks up the state change
          radioInput.dispatchEvent(new Event('change'));
        }
      } else {
        // Fallback for standard buttons/links
        el.click();
      }
    }
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
