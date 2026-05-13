export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    SHIPPED = "SHIPPED",
    CANCELLED = "CANCELLED"
}
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
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
export interface CreateOrderDto {
    items: {
        productId: string;
        quantity: number;
    }[];
}
export interface OrderFilters {
    status?: OrderStatus;
    page?: number;
    limit?: number;
}
