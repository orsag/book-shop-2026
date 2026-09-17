import { Component, inject } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';
import { OrderService, ToastService } from '@service';
import { CartStateRoot, CartActions, selectOrders } from '@ngrx';
import { Store } from '@ngrx/store';
import { OrderStatus } from '@store/libs';
import { delay } from 'rxjs';

@Component({
  selector: 'app-order-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    TranslocoDirective,
  ],
  templateUrl: './order-table.html',
  styleUrl: './order-table.css',
})
export class OrderTable {
  private destroyRef = inject(DestroyRef);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);
  private readonly store = inject(Store<CartStateRoot>);

  readonly orders = this.store.selectSignal(selectOrders);

  updateStatus(id: string, status: string) {
    const typedStatus = status as OrderStatus;
    this.store.dispatch(
      CartActions.updateOrderLocal({ id, status: typedStatus }),
    );
    this.orderService
      .updateStatus(id, status)
      .pipe(delay(500), takeUntilDestroyed(this.destroyRef))
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
      this.store.dispatch(CartActions.removeOrderLocal({ id }));
      this.orderService
        .deleteOrder(id)
        .pipe(delay(500), takeUntilDestroyed(this.destroyRef))
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
    switch (status as OrderStatus) {
      case 'PAID':
        return 'status-chip-paid';
      case 'SHIPPED':
        return 'status-chip-shipped';
      case 'CANCELLED':
        return 'status-chip-cancelled';
      case 'PENDING':
        return 'status-chip-pending';
      default:
        return 'status-chip-default';
    }
  }
}
