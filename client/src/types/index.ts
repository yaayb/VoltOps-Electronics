export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type ProductCategory =
  | 'Laptops'
  | 'Smartphones'
  | 'Tablets'
  | 'Gaming'
  | 'Audio';

export type SerialStatus = 'IN_STOCK' | 'SOLD' | 'RMA';

export type PromoType = 'PERCENT' | 'FIXED';

export type OrderChannel = 'STOREFRONT' | 'POS';

export type OrderStatus = 'PENDING' | 'PACKED' | 'SHIPPED' | 'COMPLETED';

export type RmaStatus = 'RECEIVED' | 'DIAGNOSING' | 'REPAIRING' | 'RESOLVED';

export type WorkspaceMode = 'STOREFRONT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface StoreSetting {
  id: string;
  storeName: string;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  taxRatePercent: number;
  updatedAt: string;
}

export interface SerialPreview {
  id: string;
  serial: string;
  status: SerialStatus;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  stock: number;
  warrantyMonths: number;
  visible: boolean;
  featured: boolean;
  specProcessor: string;
  specMemory: string;
  specDisplay: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  serialUnits?: SerialPreview[];
}

export interface PromoCode {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  minSpend: number;
  active: boolean;
  createdAt?: string;
}

export interface ValidatedPromoResult {
  valid: boolean;
  promo: {
    id: string;
    code: string;
    type: PromoType;
    value: number;
    minSpend: number;
  };
  discount: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  warrantyMonths: number;
  serialNumbers: string;
  allocatedSerials: string[];
}

export interface OrderSerialCertificateUnit {
  id: string;
  serial: string;
  productId: string;
  status: SerialStatus;
  orderId: string | null;
  orderItemId: string | null;
  customerName: string | null;
  soldAt: string | null;
  warrantyUntil: string | null;
  product: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    category: ProductCategory;
    warrantyMonths: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  channel: OrderChannel;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  promoCode: string | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  serialUnits: OrderSerialCertificateUnit[];
}

export interface SerialUnitDetail {
  id: string;
  serial: string;
  productId: string;
  status: SerialStatus;
  orderId: string | null;
  orderItemId: string | null;
  customerName: string | null;
  soldAt: string | null;
  warrantyUntil: string | null;
  createdAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    category: ProductCategory;
    price?: number;
    warrantyMonths: number;
    imageUrl: string;
  };
  order: {
    id?: string;
    orderNumber: string;
    channel: OrderChannel;
    customerName?: string;
    customerEmail?: string;
    createdAt: string;
  } | null;
  rmaTickets: RmaTicketSummary[];
}

export interface RmaTicketSummary {
  id: string;
  ticketNumber: string;
  status: RmaStatus;
  issueDescription?: string;
  technicianNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RmaTicket {
  id: string;
  ticketNumber: string;
  serialUnitId: string;
  customerName: string;
  issueDescription: string;
  technicianNotes: string;
  status: RmaStatus;
  createdAt: string;
  updatedAt: string;
  serialUnit: {
    id: string;
    serial: string;
    status: SerialStatus;
    customerName: string | null;
    soldAt: string | null;
    warrantyUntil: string | null;
    product: {
      id: string;
      sku: string;
      name: string;
      brand: string;
      category: ProductCategory;
      warrantyMonths: number;
      imageUrl: string;
    };
    order: {
      id: string;
      orderNumber: string;
      channel: OrderChannel;
      customerEmail: string;
    } | null;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  stockStatus?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  visibleOnly?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'stock_asc' | 'newest';
}

export interface CreateProductPayload {
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  stock: number;
  warrantyMonths: number;
  visible: boolean;
  featured: boolean;
  specProcessor: string;
  specMemory: string;
  specDisplay: string;
  imageUrl: string;
}

export interface UpdateProductPayload {
  name?: string;
  brand?: string;
  category?: ProductCategory;
  price?: number;
  stock?: number;
  warrantyMonths?: number;
  visible?: boolean;
  featured?: boolean;
  specProcessor?: string;
  specMemory?: string;
  specDisplay?: string;
  imageUrl?: string;
}

export interface CreateOrderPayload {
  channel: OrderChannel;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod: string;
  promoCode?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export interface CreateRmaPayload {
  serial: string;
  customerName: string;
  issueDescription: string;
  technicianNotes?: string;
}

export interface UpdateSettingsPayload {
  storeName: string;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  taxRatePercent: number;
  promoCodes?: Array<{
    id?: string;
    code: string;
    type: PromoType;
    value: number;
    minSpend: number;
    active: boolean;
  }>;
}
