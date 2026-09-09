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
import { MatCard } from '@angular/material/card';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-toast',
  imports: [
    CommonModule,
    LucideInfo,
    LucideCircleCheck,
    LucideTriangleAlert,
    LucideCircleX,
    LucideX,
    MatCard,
    MatIconButton,
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
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
    simple: 'toast-type-simple',
    success: 'toast-type-success',
    warning: 'toast-type-warning',
    danger: 'toast-type-danger',
  };
}