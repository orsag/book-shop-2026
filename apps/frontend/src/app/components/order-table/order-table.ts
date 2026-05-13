import { Component, inject, signal } from '@angular/core';
import { CreatedOrder, OrderService } from '../../services/order-service';
import { OrderStatus } from '@store/shared-models';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-order-table',
  imports: [CommonModule, CurrencyPipe, DatePipe, TranslocoDirective],
  templateUrl: './order-table.html',
  styleUrl: './order-table.css',
})
export class OrderTable {
  private orderService = inject(OrderService);

  // Local state signals
  orders = signal<CreatedOrder[]>([]);
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadAllOrders();
  }

  loadAllOrders() {
    this.isLoading.set(true);
    this.orderService.getAllGlobalOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  updateStatus(id: string, status: string) {
    this.orderService.updateStatus(id, status).subscribe(() => {
      // Optimistic or Refresh update
      this.orders.update((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: status as OrderStatus } : o,
        ),
      );
    });
  }

  removeOrder(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(id).subscribe(() => {
        this.orders.update((prev) => prev.filter((o) => o.id !== id));
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
