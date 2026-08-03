import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  Renderer2,
} from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

const ALLOWED_TYPES = ['text', 'number', 'email', 'password'];

@Directive({
  selector: 'input[appBlueFocus], textarea[appBlueFocus]',
  standalone: true,
})
export class BlueFocusDirective implements OnInit, OnDestroy {
  private focusMonitor = inject(FocusMonitor);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit() {
    this.focusMonitor.monitor(this.elementRef).subscribe((origin) => {
      const el = this.elementRef.nativeElement;
      const isTextLike =
        el.tagName === 'TEXTAREA' || ALLOWED_TYPES.includes(el.type);

      if (origin && isTextLike) {
        this.applyStyles();
      } else {
        this.removeStyles();
      }
    });
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.elementRef);
  }

  private applyStyles() {
    const el = this.elementRef.nativeElement;
    this.renderer.addClass(el, 'outline-none');
    this.renderer.addClass(el, 'bg-sky-200');
    this.renderer.addClass(el, 'dark:bg-slate-700');
    this.renderer.addClass(el, 'text-slate-900');
    this.renderer.addClass(el, 'dark:text-slate-100');
  }

  private removeStyles() {
    const el = this.elementRef.nativeElement;
    this.renderer.removeClass(el, 'outline-none');
    this.renderer.removeClass(el, 'bg-sky-200');
    this.renderer.removeClass(el, 'dark:bg-slate-700');
    this.renderer.removeClass(el, 'text-slate-900');
    this.renderer.removeClass(el, 'dark:text-slate-100');
  }
}
