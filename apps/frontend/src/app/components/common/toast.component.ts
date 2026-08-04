import {
  Component,
  inject,
  signal,
  effect,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '@service';
import {
  LucideInfo,
  LucideCircleCheck,
  LucideTriangleAlert,
  LucideCircleX,
  LucideX,
} from '@lucide/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    CommonModule,
    LucideInfo,
    LucideCircleCheck,
    LucideTriangleAlert,
    LucideCircleX,
    LucideX,
  ],
  styles: [
    `
      @property --radialprogress {
        syntax: '<percentage>';
        inherits: true;
        initial-value: 0%;
      }
    `,
  ],
  template: `
    @if (toastService.toasts().length > 0) {
      <div data-testid="toast" class="toast toast-bottom toast-right z-9999">
        @for (toast of toastService.toasts(); track toast.id) {
          <div
            data-testid="toast-item"
            role="alert"
            class="flex items-center justify-center gap-3 w-full max-w-xs p-4 bg-white rounded-xl border border-gray-200 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <div
              class="relative shrink-0 flex items-center justify-center size-9 rounded-full"
              [ngClass]="typeCircleClasses[toast.type]"
            >
              <div
                class="radial-progress absolute inset-0"
                style="--size: 2.25rem; --thickness: 0.2rem"
                [style.--value]="remaining(toast)"
                aria-hidden="true"
              ></div>
              @switch (toast.type) {
                @case ('success') {
                  <svg lucideCircleCheck class="relative size-5"></svg>
                }
                @case ('warning') {
                  <svg lucideTriangleAlert class="relative size-5"></svg>
                }
                @case ('danger') {
                  <svg lucideCircleX class="relative size-5"></svg>
                }
                @default {
                  <svg lucideInfo class="relative size-5"></svg>
                }
              }
            </div>
            <div class="font-medium text-gray-600 dark:text-gray-300 text-left whitespace-pre-line">
              {{ toast.text }}
            </div>
            <button
              type="button"
              class="ms-auto shrink-0 inline-flex items-center justify-center size-6 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-700"
              (click)="toastService.dismiss(toast.id)"
              aria-label="Close notification"
            >
              <svg lucideX class="size-4"></svg>
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class Toast implements OnInit, OnDestroy {
  protected toastService = inject(ToastService);

  private now = signal(Date.now());
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const count = this.toastService.toasts().length;
      if (count > 0 && this.timer === null) {
        this.timer = setInterval(() => this.now.set(Date.now()), 100);
      } else if (count === 0 && this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
    });
  }

  ngOnInit() {
    this.now.set(Date.now());
  }

  ngOnDestroy() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  remaining(toast: { duration: number; expiresAt: number }) {
    const frac = (toast.expiresAt - this.now()) / toast.duration;
    return Math.max(0, Math.min(100, Math.round(frac * 100)));
  }

  typeCircleClasses: Record<ToastType, string> = {
    simple:
      'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    success:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    warning:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  };
}
