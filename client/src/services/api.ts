import {
  CreateOrderPayload,
  CreateProductPayload,
  CreateRmaPayload,
  Order,
  OrderStatus,
  Product,
  ProductFilters,
  PromoCode,
  RmaStatus,
  RmaTicket,
  SerialUnitDetail,
  StoreSetting,
  UpdateProductPayload,
  UpdateSettingsPayload,
  User,
  ValidatedPromoResult,
} from '../types';

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;

  constructor(message: string, status: number, code = 'API_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const data: unknown = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    let errorCode = 'API_ERROR';

    if (typeof data === 'object' && data !== null) {
      const errObj = data as Record<string, unknown>;
      if (typeof errObj.error === 'string') {
        errorMessage = errObj.error;
      }
      if (typeof errObj.code === 'string') {
        errorCode = errObj.code;
      }
    }

    throw new ApiClientError(errorMessage, response.status, errorCode);
  }

  return data as T;
}

function toQueryString(params: Record<string, string | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }
  const str = searchParams.toString();
  return str ? `?${str}` : '';
}

export const api = {
  auth: {
    me: () => request<{ user: User }>('/auth/me'),
    login: (payload: { email: string; password: string }) =>
      request<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    register: (payload: { name: string; email: string; password: string }) =>
      request<{ user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),
  },

  products: {
    list: (filters: ProductFilters = {}) =>
      request<{ products: Product[] }>(
        `/products${toQueryString({
          category: filters.category,
          search: filters.search,
          stockStatus: filters.stockStatus,
          visibleOnly: filters.visibleOnly,
          sort: filters.sort,
        })}`
      ),
    create: (payload: CreateProductPayload) =>
      request<{ product: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: UpdateProductPayload) =>
      request<{ product: Product }>(`/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  orders: {
    validatePromo: (payload: { code: string; subtotal: number }) =>
      request<ValidatedPromoResult>('/orders/validate-promo', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    create: (payload: CreateOrderPayload) =>
      request<{ order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    list: (filters: { channel?: string; status?: string; search?: string } = {}) =>
      request<{ orders: Order[] }>(
        `/orders${toQueryString({
          channel: filters.channel,
          status: filters.status,
          search: filters.search,
        })}`
      ),
    updateStatus: (id: string, status: OrderStatus) =>
      request<{ order: Order }>(`/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  serials: {
    list: (filters: { search?: string; status?: string; productId?: string } = {}) =>
      request<{ serials: SerialUnitDetail[] }>(
        `/serials${toQueryString({
          search: filters.search,
          status: filters.status,
          productId: filters.productId,
        })}`
      ),
    lookupPublic: (serial: string) =>
      request<{ serialUnit: SerialUnitDetail }>(
        `/serials/lookup/${encodeURIComponent(serial.trim())}`
      ),
  },

  rma: {
    list: (filters: { status?: string; search?: string } = {}) =>
      request<{ tickets: RmaTicket[] }>(
        `/rma${toQueryString({
          status: filters.status,
          search: filters.search,
        })}`
      ),
    create: (payload: CreateRmaPayload) =>
      request<{ ticket: RmaTicket }>('/rma', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    updateStatus: (
      id: string,
      payload: { status: RmaStatus; technicianNotes?: string }
    ) =>
      request<{ ticket: RmaTicket }>(`/rma/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  settings: {
    get: () =>
      request<{ settings: StoreSetting; promoCodes: PromoCode[] }>('/settings'),
    update: (payload: UpdateSettingsPayload) =>
      request<{ settings: StoreSetting; promoCodes: PromoCode[] }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },
};
