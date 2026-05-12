export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

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
