import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toastService.toasts().length > 0) {
      <div data-testid="toast" class="toast toast-bottom toast-right z-9999">
        @for (toast of toastService.toasts(); track toast.id) {
          <div
            class="alert shadow-lg border-none animate-in fade-in slide-in-from-top-4 duration-500"
            [class.alert-info]="toast.type === 'info'"
            [class.alert-success]="toast.type === 'success'"
            [class.alert-error]="toast.type === 'alert'"
          >
            <span class="text-md font-bold text-left whitespace-pre-line">
              {{ toast.text }}
            </span>
          </div>
        }
      </div>
    }
  `,
})
export class ToastComponent {
  protected toastService = inject(ToastService);
}
