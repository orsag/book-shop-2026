import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, OrderStatus, Order } from '@store/shared-models';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: OrderItem[];
}

export interface CreatedOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  items: {
    productId: string;
    quantity: number;
    price: number; // The price locked at purchase
    product: Product; // Full book details included via relation
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/order';

  createOrder(orderData: CreateOrderDto): Observable<CreatedOrder> {
    return this.http.post<CreatedOrder>(this.API_URL, orderData);
  }

  getOrderById(orderId: string): Observable<CreatedOrder> {
    return this.http.get<CreatedOrder>(`${this.API_URL}/${orderId}`);
  }

  getUserOrders(userId: string): Observable<CreatedOrder[]> {
    return this.http.get<CreatedOrder[]>(`${this.API_URL}/user/${userId}`);
  }

  cancelOrder(orderId: string): Observable<CreatedOrder> {
    return this.http.patch<CreatedOrder>(
      `${this.API_URL}/${orderId}/cancel`,
      {},
    );
  }

  /**
   * Administration: Fetch all orders from all users
   */
  getAllGlobalOrders(): Observable<CreatedOrder[]> {
    return this.http.get<CreatedOrder[]>(`${this.API_URL}/all`);
  }

  /**
   * Administration: Update the status of any order (PAID, SHIPPED, etc.)
   */
  updateStatus(orderId: string, status: string): Observable<CreatedOrder> {
    return this.http.patch<CreatedOrder>(`${this.API_URL}/${orderId}/status`, {
      status,
    });
  }

  /**
   * Administration: Completely remove an order from the system
   */
  deleteOrder(orderId: string): Observable<Order> {
    return this.http.delete<Order>(`${this.API_URL}/${orderId}`);
  }
}
