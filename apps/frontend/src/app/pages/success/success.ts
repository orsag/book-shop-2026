import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CreatedOrder, CreatedOrderItem, OrderService } from '@service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  LucideChessQueen,
  LucideFrown,
  LucideShoppingBasket,
  LucideCircleUserRound,
} from '@lucide/angular';
import { TotalPricePipe, SinglePricePipe } from '@core';

@Component({
  selector: 'app-success',
  imports: [
    CommonModule,
    RouterModule,
    LucideChessQueen,
    LucideFrown,
    LucideShoppingBasket,
    LucideCircleUserRound,
    CurrencyPipe,
    TotalPricePipe,
    SinglePricePipe,
  ],
  templateUrl: './success.html',
  styleUrl: './success.css',
})
export class Success implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = signal<CreatedOrder | null>(null);
  orderItems = computed<CreatedOrderItem[]>(() => {
    return (this.order()?.items as CreatedOrderItem[]) ?? [];
  });
  isLoading = signal(true);
  routeId = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.routeId.set(id);
      if (this.routeId) {
        this.orderService.getOrderById(this.routeId()).subscribe({
          next: (data) => {
            this.order.set(data);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      }
    }
  }
}
