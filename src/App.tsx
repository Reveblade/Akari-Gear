import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { WhatsAppButton } from './components/WhatsAppButton'
import { LandingPage } from './pages/LandingPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { Verify2FAPage } from './pages/Verify2FAPage'
import { CartPage } from './pages/CartPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { OrderDetailPage } from './pages/OrderDetailPage'

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-zinc-900">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/verify-2fa" element={<Verify2FAPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderDetailPage />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        }
      />
    </Routes>
  )
}
