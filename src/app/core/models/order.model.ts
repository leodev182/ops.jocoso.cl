export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'SHIPPED' | 'DELIVERED';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
