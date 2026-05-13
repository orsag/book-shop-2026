import { Injectable, signal } from '@angular/core';

export type ToastType = 'info' | 'success' | 'alert';

interface Toast {
  id: number;
  text: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // Private signal to manage state
  private toastsSignal = signal<Toast[]>([]);

  // Public readonly signal for components to consume
  public toasts = this.toastsSignal.asReadonly();

  show(text: string, type: ToastType = 'info') {
    const id = Date.now();

    // Add new common to the list
    this.toastsSignal.update((all) => [...all, { id, text, type }]);

    // Auto-remove after 3000ms
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  success(text: string) {
    this.show(text, 'success');
  }

  alert(text: string) {
    this.show(text, 'alert');
  }

  info(text: string) {
    this.show(text, 'info');
  }

  private remove(id: number) {
    this.toastsSignal.update((all) => all.filter((t) => t.id !== id));
  }
}
