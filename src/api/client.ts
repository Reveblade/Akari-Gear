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
        active?: boolean
      }) => {
        const search = new URLSearchParams()
        if (params?.page) search.set('page', String(params.page))
        if (params?.limit) search.set('limit', String(params.limit))
        if (params?.category) search.set('category', params.category)
        if (params?.active === false) search.set('active', 'false')
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
      list: () =>
        fetchApi<import('../types').CategoriesResponse>('/admin/categories'),
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
