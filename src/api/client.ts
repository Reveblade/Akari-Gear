const API_BASE = '/api'
const TOKEN_KEY = 'auth_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    const msg =
      err.error ??
      (Array.isArray(err.errors) && err.errors[0]?.msg) ??
      `HTTP ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchApi<import('../types').AuthResponse | import('../types').Login2FAResponse>(
        '/auth/login',
        { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    getMe: () => fetchApi<{ user: import('../types').User }>('/auth/me'),
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
  },

  admin: {
    products: {
      list: (params?: {
        page?: number
        limit?: number
        category?: string
        subcategory?: string
        search?: string
        featured?: boolean
        active?: boolean
        inactive?: boolean
      }) => {
        const search = new URLSearchParams()
        if (params?.page) search.set('page', String(params.page))
        if (params?.limit) search.set('limit', String(params.limit))
        if (params?.category) search.set('category', params.category)
        if (params?.subcategory) search.set('subcategory', params.subcategory)
        if (params?.search) search.set('search', params.search)
        if (params?.featured) search.set('featured', 'true')
        if (params?.active === false) search.set('active', 'false')
        if (params?.inactive) search.set('inactive', 'true')
        const qs = search.toString()
        return fetchApi<{
          products: import('../types').Product[]
          pagination: { page: number; limit: number; total: number; pages: number }
        }>(`/admin/products${qs ? `?${qs}` : ''}`)
      },
      get: (slug: string) =>
        fetchApi<{ product: import('../types').Product }>(`/admin/products/${slug}`),
      create: (data: import('../types').CreateProductRequest) =>
        fetchApi<{ product: import('../types').Product }>('/admin/products', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: import('../types').UpdateProductRequest) =>
        fetchApi<{ product: import('../types').Product }>(`/admin/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        fetchApi<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),
    },
    categories: {
      list: (params?: { active?: boolean }) => {
        const qs = params?.active === false ? '?active=false' : ''
        return fetchApi<import('../types').CategoriesResponse>(`/admin/categories${qs}`)
      },
      get: (id: string) =>
        fetchApi<{ category: import('../types').Category }>(`/admin/categories/${id}`),
      create: (data: { name: string; slug: string; description?: string; subcategories?: { name: string; slug: string }[] }) =>
        fetchApi<{ category: import('../types').Category }>('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(data),
        }),
      update: (id: string, data: { name?: string; slug?: string; description?: string; subcategories?: { name: string; slug: string }[] }) =>
        fetchApi<{ category: import('../types').Category }>(`/admin/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        fetchApi<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE' }),
    },
    orders: {
      list: (params?: { status?: string; code?: string }) => {
        const search = new URLSearchParams()
        if (params?.status) search.set('status', params.status)
        if (params?.code) search.set('code', params.code)
        const qs = search.toString()
        return fetchApi<{ orders: import('../types').Order[] }>(`/admin/orders${qs ? `?${qs}` : ''}`)
      },
      get: (id: string) =>
        fetchApi<{ order: import('../types').Order }>(`/admin/orders/${id}`),
      updateStatus: (id: string, status: string) =>
        fetchApi<{ order: import('../types').Order }>(`/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
      delete: (id: string) =>
        fetchApi<{ message: string }>(`/admin/orders/${id}`, { method: 'DELETE' }),
    },
    users: {
      list: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
        const search = new URLSearchParams()
        if (params?.page) search.set('page', String(params.page))
        if (params?.limit) search.set('limit', String(params.limit))
        if (params?.search) search.set('search', params.search)
        if (params?.role) search.set('role', params.role)
        const qs = search.toString()
        return fetchApi<{
          users: import('../types').AdminUser[]
          pagination: { page: number; limit: number; total: number; pages: number }
        }>(`/admin/users${qs ? `?${qs}` : ''}`)
      },
      block: (id: string) =>
        fetchApi<{ message: string; user: import('../types').AdminUser }>(`/admin/users/${id}/block`, {
          method: 'PATCH',
        }),
      unblock: (id: string) =>
        fetchApi<{ message: string; user: import('../types').AdminUser }>(`/admin/users/${id}/unblock`, {
          method: 'PATCH',
        }),
      delete: (id: string) =>
        fetchApi<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),
      get: (id: string) =>
        fetchApi<{ user: import('../types').AdminUser }>(`/admin/users/${id}`),
      getOrders: (id: string) =>
        fetchApi<{ orders: import('../types').Order[] }>(`/admin/users/${id}/orders`),
    },
    exchangeRate: {
      get: () =>
        fetchApi<{ rate: { usdToTry: number; date: string; source: string } }>('/exchange-rate'),
      fetch: () =>
        fetchApi<{ message: string; rate: { usdToTry: number; date: string; source: string } }>(
          '/exchange-rate/fetch',
          { method: 'POST' }
        ),
      set: (usdToTry: number) =>
        fetchApi<{ message: string; rate: { usdToTry: number; date: string; source: string } }>(
          '/exchange-rate/set',
          { method: 'POST', body: JSON.stringify({ usdToTry }) }
        ),
    },
    uploadImage: async (file: File): Promise<{ url: string }> => {
      const token = getStoredToken()
      if (!token) throw new Error('Oturum açmanız gerekiyor')
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API_BASE}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error ?? 'Yükleme başarısız')
      }
      return res.json()
    },
  },
}
