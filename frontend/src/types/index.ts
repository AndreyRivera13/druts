export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: 'admin' | 'customer';
  avatarUrl?: string;
  totalPurchases: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  country?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex?: string;
  stock: number;
  lowStockThreshold: number;
  sku?: string;
  priceAdjustment?: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  currentPrice: number;
  discountPercent: number;
  category: Category;
  brand: Brand;
  gender: 'M' | 'F' | 'U' | 'K';
  material?: string;
  season?: string;
  isActive: boolean;
  isFeatured: boolean;
  totalSold: number;
  viewCount: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  images: ProductImage[];
  totalStock: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type PaymentMethod =
  | 'cash_on_delivery' | 'credit_card' | 'debit_card'
  | 'pse' | 'nequi' | 'daviplata';

export interface OrderItem {
  id: string;
  product: Product;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productImageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  shippingRecipient: string;
  trackingCode?: string;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DashboardSummary {
  orders: { total: number; today: number; thisMonth: number };
  revenue: { total: number; thisMonth: number; lastMonth: number; monthGrowth: number };
  products: number;
  users: number;
  pendingOrders: number;
  monthOrders: number;
  lastMonthOrders: number;
  orderGrowth: number;
}
