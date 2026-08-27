export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
export type OrderOrigin = 'WEB' | 'ML' | 'CARD' | 'TRANSFER' | 'CASH';

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName?: string | null;
  sku?: string | null;
  quantity: number;
  price: string;
}

export interface OrderUser {
  id: string;
  name: string | null;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: OrderUser | null;
  addressId: string | null;
  status: OrderStatus;
  origin: OrderOrigin;
  totalAmount: string;
  trackingCode: string | null;
  shippingLabel: string | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
