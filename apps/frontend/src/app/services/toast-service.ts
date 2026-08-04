import { inject, Injectable, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export type ToastType = 'simple' | 'success' | 'danger' | 'warning';

interface Toast {
  id: string;
  text: string;
  type: ToastType;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private live = inject(LiveAnnouncer);
  // Private signal to manage state
  private toastsSignal = signal<Toast[]>([]);

  // Public readonly signal for components to consume
  public toasts = this.toastsSignal.asReadonly();

  show(text: string, type: ToastType = 'simple', duration = 10000) {
    const id = crypto.randomUUID();

    // Add new common to the list
    this.toastsSignal.update((all) => [...all, { id, text, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(text: string, duration?: number) {
    this.show(text, 'success', duration);
    this.live.announce(text, 'assertive');
  }

  alert(text: string, duration?: number) {
    this.show(text, 'warning', duration);
    this.live.announce(text, 'assertive');
  }

  info(text: string, duration?: number) {
    this.show(text, 'simple', duration);
    this.live.announce(text, 'assertive');
  }

  danger(text: string, duration?: number) {
    this.show(text, 'danger', duration);
    this.live.announce(text, 'assertive');
  }

  private remove(id: string) {
    this.toastsSignal.update((all) => all.filter((t) => t.id !== id));
  }
}
