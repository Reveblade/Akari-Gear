import { Routes, Route } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { Verify2FAPage } from './pages/Verify2FAPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { AdminProductFormPage } from './pages/AdminProductFormPage'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { AdminOrderDetailPage } from './pages/AdminOrderDetailPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-2fa" element={<Verify2FAPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
      </Route>
    </Routes>
  )
}
