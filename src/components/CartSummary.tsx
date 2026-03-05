import { Link } from 'react-router-dom'
import type { AddressData } from './AddressForm'

interface CartSummaryProps {
  total: number
  itemCount: number
  address?: AddressData | null
  onPlaceOrder?: (address: AddressData) => Promise<void>
  placingOrder?: boolean
}

export function CartSummary({ total, itemCount, address, onPlaceOrder, placingOrder }: CartSummaryProps) {
  const canPlace = address && address.fullName.trim() && address.phone.trim() && address.city.trim() && address.district.trim() && address.neighborhood.trim() && address.address.trim()
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
      <h3 className="font-display text-lg font-semibold text-surface-800 dark:text-zinc-100">
        Sipariş Özeti
      </h3>
      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm text-surface-600 dark:text-zinc-400">
          <span>Ara Toplam ({itemCount} ürün)</span>
          <span>₺{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-surface-600 dark:text-zinc-400">
          <span>Kargo</span>
          <span className="text-green-600 dark:text-green-400">Hesaplanacak</span>
        </div>
      </div>
      <div className="mt-4 border-t border-surface-200 pt-4 dark:border-zinc-600">
        <div className="flex justify-between text-lg font-semibold text-surface-800 dark:text-zinc-100">
          <span>Toplam</span>
          <span>₺{total.toLocaleString()}</span>
        </div>
        <p className="mt-2 text-xs text-surface-500 dark:text-zinc-500">
          * Döviz kuru ile hesaplanmıştır. Sipariş onaylandıktan sonra ödeme ve kargo bilgisi tarafınıza iletilecektir.
        </p>
      </div>
      <div className="mt-6 space-y-3">
        {onPlaceOrder && canPlace && (
          <button
            type="button"
            onClick={() => address && onPlaceOrder(address)}
            disabled={placingOrder}
            className="block w-full rounded-xl bg-primary-500 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-50"
          >
            {placingOrder ? 'Sipariş oluşturuluyor...' : 'Siparişi Tamamla'}
          </button>
        )}
        <Link
          to="/products"
          className="block w-full rounded-xl border border-surface-200 py-3 text-center text-sm font-medium text-surface-700 transition hover:bg-surface-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Alışverişe devam
        </Link>
      </div>
    </div>
  )
}
