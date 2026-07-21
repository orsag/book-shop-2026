import { Component, inject } from '@angular/core';
import { OrderService, ToastService } from '@service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { delay } from 'rxjs';
import { OrderStatus } from '@store/libs';
import { CartStore } from '../../store/cart-store';

@Component({
  selector: 'app-order-table',
  imports: [CommonModule, CurrencyPipe, DatePipe, TranslocoDirective],
  templateUrl: './order-table.html',
  styleUrl: './order-table.css',
})
export class OrderTable {
  store = inject(CartStore);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  updateStatus(id: string, status: string) {
    const typedStatus = status as OrderStatus;
    // 1. Update UI Immediately (Instant feedback)
    this.store.updateOrderLocal(id, typedStatus);

    this.orderService
      .updateStatus(id, status)
      .pipe(delay(500))
      .subscribe({
        next: () => {
          this.toast.success('Status updated');
        },
        error: () => {
          this.toast.alert('Update failed, not reloading.');
        },
      });
  }

  removeOrder(id: string, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    if (confirm('Are you sure you want to delete this order?')) {
      // 1. Update UI Immediately (Instant feedback)
      this.store.removeOrderLocal(id);

      this.orderService
        .deleteOrder(id)
        .pipe(delay(500))
        .subscribe({
          next: () => {
            this.toast.success('Status updated');
          },
          error: (err) => {
            console.error('Delete failed:', err);
            const message =
              err.status === 500
                ? 'Cannot delete order because server error.'
                : 'Failed to delete order. Please try again.';
            this.toast.alert(message);
          },
        });
    }
  }

  getStatusClass(status: string): string {
    const base = 'badge badge-sm font-bold ';
    switch (status) {
      case 'PAID':
        return base + 'badge-success text-white';
      case 'SHIPPED':
        return base + 'badge-info text-white';
      case 'CANCELLED':
        return base + 'badge-error';
      case 'PENDING':
        return base + 'badge-warning';
      default:
        return base + 'badge-ghost';
    }
  }
}
