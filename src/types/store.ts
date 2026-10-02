export type ProductCategory = 
  | 'semua'
  | 'elektronik'
  | 'fashion'
  | 'kuliner'
  | 'rumah-tangga'
  | 'kecantikan'
  | 'hobi';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  price: number;
  originalPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  weightGram: number;
  badge?: string;
  soldCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
  notes?: string;
}

export type PaymentChannel = 
  | 'QRIS'
  | 'VA_BCA'
  | 'VA_MANDIRI'
  | 'VA_BRI'
  | 'VA_BNI'
  | 'GOPAY'
  | 'OVO'
  | 'DANA'
  | 'SHOPEEPAY'
  | 'CREDIT_CARD'
  | 'COD';

export interface PaymentOption {
  id: PaymentChannel;
  name: string;
  category: 'qris' | 'va' | 'ewallet' | 'card' | 'cod';
  description: string;
  adminFee: number;
  iconName: string;
}

export interface ShippingCourier {
  id: string;
  courierName: string;
  service: string;
  cost: number;
  etd: string;
}

export interface ShippingAddress {
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
}

export type PaymentStatus = 
  | 'MENUNGGU_PEMBAYARAN'
  | 'SUDAH_DIBAYAR'
  | 'KEDALUWARSA'
  | 'GAGAL';

export type OrderStatus = 
  | 'MENUNGGU_PEMBAYARAN'
  | 'DIPROSES'
  | 'DIKIRIM'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface Order {
  id: string; // e.g. "INV-20261002-7489"
  createdAt: string;
  paidAt?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  courier: ShippingCourier;
  discount: number;
  voucherCode?: string;
  adminFee: number;
  total: number;
  paymentMethod: PaymentOption;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  vaNumber?: string;
  qrisPayload?: string;
  paymentExpiresAt?: string;
}

export interface Voucher {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minSpend: number;
  description: string;
}

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: ShippingAddress;
  createdAt: string;
}
