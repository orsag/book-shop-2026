import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'alert';

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
  // Private signal to manage state
  private toastsSignal = signal<Toast[]>([]);

  // Public readonly signal for components to consume
  public toasts = this.toastsSignal.asReadonly();

  show(text: string, type: ToastType = 'info', duration = 3000) {
    const id = crypto.randomUUID();

    // Add new common to the list
    this.toastsSignal.update((all) => [...all, { id, text, type }]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(text: string, duration?: number) {
    this.show(text, 'success', duration);
  }

  alert(text: string, duration?: number) {
    this.show(text, 'alert', duration);
  }

  info(text: string, duration?: number) {
    this.show(text, 'info', duration);
  }

  private remove(id: string) {
    this.toastsSignal.update((all) => all.filter((t) => t.id !== id));
  }
}
