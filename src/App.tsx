import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductFormPage } from './pages/AdminProductFormPage'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/AdminOrderDetailPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminUserDetailPage } from './pages/AdminUserDetailPage'
import { AdminCategoriesPage } from './pages/AdminCategoriesPage'
import { AdminExchangeRatePage } from './pages/AdminExchangeRatePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="exchange-rate" element={<AdminExchangeRatePage />} />
      </Route>
    </Routes>
  )
}
