import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderStatus, Order } from '@store/shared-models';
import { Observable } from 'rxjs';
import { CreateProductDto as IProduct, CreateOrderDto } from '@api';
import { ApiService } from './api.service';

export interface CreatedOrderItem {
  productId: string;
  quantity: number;
  price: number;
  product: IProduct;
}

export interface CreatedOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  items: CreatedOrderItem[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private api = inject(ApiService);
  private readonly API_URL = '/api/order';

  createOrder(orderData: CreateOrderDto): Observable<CreatedOrder> {
    return this.api.post<CreatedOrder>(this.API_URL, orderData);
  }

  getOrderById(orderId: string): Observable<CreatedOrder> {
    return this.api.get<CreatedOrder>(`${this.API_URL}/${orderId}`);
  }

  getUserOrders(userId: string): Observable<CreatedOrder[]> {
    return this.api.get<CreatedOrder[]>(`${this.API_URL}/user/${userId}`);
  }

  cancelOrder(orderId: string): Observable<CreatedOrder> {
    return this.api.patch<CreatedOrder>(
      `${this.API_URL}/${orderId}/cancel`,
      {},
    );
  }

  /**
   * Administration: Fetch all orders from all users
   */
  getAllGlobalOrders(): Observable<CreatedOrder[]> {
    return this.api.get<CreatedOrder[]>(`${this.API_URL}/all`);
  }

  /**
   * Administration: Update the status of any order (PAID, SHIPPED, etc.)
   */
  updateStatus(orderId: string, status: string): Observable<CreatedOrder> {
    return this.api.patch<CreatedOrder>(`${this.API_URL}/${orderId}/status`, {
      status,
    });
  }

  /**
   * Administration: Completely remove an order from the system
   */
  deleteOrder(orderId: string): Observable<Order> {
    return this.api.delete<Order>(`${this.API_URL}/${orderId}`);
  }
}
