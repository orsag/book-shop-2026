export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // The price at the time of purchase
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// What the Frontend sends to the Backend
export interface CreateOrderDto {
  items: {
    productId: string;
    quantity: number;
  }[];
}

// For your pagination/filtering on the orders page
export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}
