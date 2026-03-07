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

export interface AdminUser {
  _id: string
  email: string
  role: string
  emailVerified: boolean
  twoFactorEnabled?: boolean
  isBlocked?: boolean
  createdAt: string
  updatedAt: string
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

export interface OrderAddress {
  fullName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  address: string
  postalCode?: string
}

export interface OrderItem {
  product: string | { _id: string; name: string; slug: string; images?: string[] }
  name: string
  slug: string
  quantity: number
  unitPriceUsd: number
  unitPriceTry: number
  subtotalTry: number
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
  _id: string
  user: string | { _id: string; email: string }
  address: OrderAddress
  items: OrderItem[]
  subtotalTry: number
  shippingCostTry: number
  totalTry: number
  discountPercent?: number
  status: OrderStatus
  exchangeRateUsdToTry: number
  exchangeRateDate: string
  createdAt: string
  updatedAt: string
}
