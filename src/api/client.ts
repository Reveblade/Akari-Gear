const API_BASE = '/api';
const TOKEN_KEY = 'auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const msg = err.error ?? (Array.isArray(err.errors) && err.errors[0]?.msg) ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  health: () => fetchApi<{ status: string }>('/health'),

  getProducts: (params?: {
    category?: string;
    subcategory?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    currency?: 'USD' | 'TRY';
    sort?: 'newest' | 'price-asc' | 'price-desc' | 'name';
  }) => {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.subcategory) search.set('subcategory', params.subcategory);
    if (params?.featured) search.set('featured', 'true');
    if (params?.search) search.set('search', params.search);
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.currency) search.set('currency', params.currency);
    if (params?.sort) search.set('sort', params.sort);
    const qs = search.toString();
    return fetchApi<import('../types').ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
  },

  getProduct: (slug: string, currency?: 'USD' | 'TRY') => {
    const qs = currency ? `?currency=${currency}` : '';
    return fetchApi<{ product: import('../types').Product }>(`/products/${slug}${qs}`);
  },

  getCategories: () =>
    fetchApi<import('../types').CategoriesResponse>('/categories'),

  getCategory: (slug: string) =>
    fetchApi<{ category: import('../types').Category }>(`/categories/${slug}`),

  getExchangeRate: () =>
    fetchApi<import('../types').ExchangeRateResponse>('/exchange-rate'),

  cart: {
    get: (currency?: 'USD' | 'TRY') => {
      const qs = currency ? `?currency=${currency}` : '';
      return fetchApi<import('../types').CartResponse>(`/cart${qs}`);
    },
    addItem: (productId: string, quantity?: number) =>
      fetchApi<import('../types').CartResponse>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity: quantity ?? 1 }),
      }),
    updateItem: (productId: string, quantity: number) =>
      fetchApi<{ message: string }>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (productId: string) =>
      fetchApi<{ message: string }>(`/cart/items/${productId}`, {
        method: 'DELETE',
      }),
  },

  orders: {
    create: (address: import('../types').OrderAddress) =>
      fetchApi<import('../types').CreateOrderResponse>('/orders', {
        method: 'POST',
        body: JSON.stringify({ address }),
      }),
    getMyOrders: (params?: { page?: number; limit?: number }) => {
      const search = new URLSearchParams();
      if (params?.page) search.set('page', String(params.page));
      if (params?.limit) search.set('limit', String(params.limit));
      const qs = search.toString();
      return fetchApi<import('../types').OrdersResponse>(`/orders${qs ? `?${qs}` : ''}`);
    },
    getOrder: (orderId: string) =>
      fetchApi<import('../types').OrderResponse>(`/orders/${orderId}`),
  },

  auth: {
    register: (email: string, password: string) =>
      fetchApi<import('../types').AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      fetchApi<import('../types').AuthResponse | import('../types').Login2FAResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    getMe: () =>
      fetchApi<{ user: import('../types').User }>('/auth/me'),
    verifyEmail: (token: string) =>
      fetchApi<import('../types').AuthResponse>('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    resendVerification: (email: string) =>
      fetchApi<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    forgotPassword: (email: string) =>
      fetchApi<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, password: string) =>
      fetchApi<import('../types').AuthResponse>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
    verify2FA: (token: string) =>
      fetchApi<import('../types').AuthResponse>('/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    resend2FA: (email: string) =>
      fetchApi<{ message: string }>('/auth/resend-2fa', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    enable2FA: () =>
      fetchApi<{ message: string; user: import('../types').User }>('/auth/enable-2fa', {
        method: 'POST',
      }),
    disable2FA: () =>
      fetchApi<{ message: string; user: import('../types').User }>('/auth/disable-2fa', {
        method: 'POST',
      }),
  },
};
