const API_BASE = '/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => fetchApi<{ status: string }>('/health'),

  getProducts: (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    currency?: 'USD' | 'TRY';
  }) => {
    const search = new URLSearchParams();
    if (params?.category) search.set('category', params.category);
    if (params?.search) search.set('search', params.search);
    if (params?.page) search.set('page', String(params.page));
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.currency) search.set('currency', params.currency);
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
};
