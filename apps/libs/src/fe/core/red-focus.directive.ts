import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  Renderer2,
} from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ConfigurationService } from '@service';

@Directive({
  selector: '[appRedFocus]',
  standalone: true,
})
export class RedFocusDirective implements OnInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);
  private config = inject(ConfigurationService);

  ngOnInit() {
    this.applyButtonVariantClasses(this.elementRef.nativeElement);

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

  private applyButtonVariantClasses(el: HTMLElement) {
    if (el.tagName !== 'BUTTON') return;
    if (!this.config.isDarkTheme()) return;

    Object.entries(this.variantDarkClasses).forEach(([btnClass, classes]) => {
      if (el.classList.contains(btnClass)) {
        classes.forEach((cls) => this.renderer.addClass(el, cls));
      }
    });
  }

  private removeStyles() {
    const el = this.elementRef.nativeElement;
    this.renderer.removeClass(el, 'outline-none');
    this.renderer.removeClass(el, 'bg-red-500');
    this.renderer.removeClass(el, 'border-red-500');
    this.renderer.removeClass(el, 'text-white');
    this.renderer.removeClass(el, 'scale-105');
  }

  private readonly variantDarkClasses: Record<string, string[]> = {
    'btn-primary': [
      'dark:bg-indigo-800',
      'dark:hover:bg-indigo-700',
      'dark:text-gray-300',
      'dark:border-indigo-600',
    ],
    'btn-success': [
      'dark:bg-emerald-900',
      'dark:hover:bg-emerald-800',
      'dark:text-gray-300',
    ],
    'btn-warning': [
      'dark:bg-yellow-900',
      'dark:hover:bg-yellow-800',
      'dark:text-yellow-100',
      'dark:border-yellow-600',
    ],
    'btn-error': [
      'dark:bg-red-800',
      'dark:hover:bg-red-700',
      'dark:text-red-100',
      'dark:border-red-600',
    ],
    'btn-info': [
      'dark:bg-blue-800',
      'dark:hover:bg-blue-700',
      'dark:text-blue-100',
      'dark:border-blue-600',
    ],
  };
}
