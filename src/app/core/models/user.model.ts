export type UserRole = 'ADMIN' | 'SUPPORT' | 'CUSTOMER';

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
}
