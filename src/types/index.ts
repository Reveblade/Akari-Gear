export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceTry?: number;
  category: Category | { _id: string; name: string; slug: string };
  images: string[];
  stock: number;
  isActive: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  exchangeRate?: {
    usdToTry: number;
    date: string;
  };
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface ExchangeRateResponse {
  rate: {
    usdToTry: number;
    date: string;
    source: string;
  };
}

export type Currency = 'USD' | 'TRY';
