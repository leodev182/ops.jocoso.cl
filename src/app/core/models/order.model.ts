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
  addressId: string | null;
  status: OrderStatus;
  totalAmount: string;
  trackingCode: string | null;
  shippingLabel: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
