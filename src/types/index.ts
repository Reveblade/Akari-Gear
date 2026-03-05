export interface SubCategory {
  name: string
  slug: string
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  isActive: boolean
  sortOrder: number
  subcategories?: SubCategory[]
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  priceTry?: number
  category: Category | { _id: string; name: string; slug: string }
  subcategory?: string
  images: string[]
  stock: number
  isActive: boolean
  isFeatured?: boolean
}

export interface CreateProductRequest {
  name: string
  slug: string
  description?: string
  price: number
  category: string
  subcategory?: string
  images?: string[]
  stock?: number
  isActive?: boolean
  isFeatured?: boolean
}

export interface UpdateProductRequest {
  name?: string
  slug?: string
  description?: string
  price?: number
  category?: string
  subcategory?: string
  images?: string[]
  stock?: number
  isActive?: boolean
  isFeatured?: boolean
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface User {
  id: string
  email: string
  role: string
  emailVerified: boolean
  twoFactorEnabled?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}

export interface Login2FAResponse {
  requiresTwoFactor: true
  email: string
  message: string
}
