import { useEffect, useState } from 'react'
import { api } from '../api/client'

export function AdminExchangeRatePage() {
  const [rate, setRate] = useState<{ usdToTry: number; date: string; source: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [newRate, setNewRate] = useState('')
  const [updating, setUpdating] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadRate()
  }, [])

  async function loadRate() {
    setLoading(true)
    setError('')
    try {
      const res = await api.admin.exchangeRate.get()
      setRate(res.rate)
      setNewRate(res.rate.usdToTry.toString())
    } catch {
      setRate(null)
      setNewRate('')
    } finally {
      setLoading(false)
    }
  }

  async function handleSetRate(e: React.FormEvent) {
    e.preventDefault()
    const val = parseFloat(newRate.replace(',', '.'))
    if (isNaN(val) || val <= 0) {
      setError('Geçerli bir kur değeri girin')
      return
    }
    setUpdating(true)
    setError('')
    try {
      const res = await api.admin.exchangeRate.set(val)
      setRate(res.rate)
      setNewRate(res.rate.usdToTry.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız')
    } finally {
      setUpdating(false)
    }
  }

  async function handleFetchFromTcmb() {
    setFetching(true)
    setError('')
    try {
      const res = await api.admin.exchangeRate.fetch()
      setRate(res.rate)
      setNewRate(res.rate.usdToTry.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'TCMB\'den kur alınamadı')
    } finally {
      setFetching(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Dolar Kuru</h1>
      <p className="mt-2 text-sm text-zinc-400">
        USD/TRY kurunu manuel güncelleyebilir veya TCMB'den otomatik çekebilirsiniz.
      </p>

      <div className="mt-8 max-w-md space-y-6 rounded-xl border border-zinc-600 bg-zinc-800 p-6">
        {rate && (
          <div>
            <h3 className="text-sm font-medium text-zinc-400">Mevcut kur</h3>
            <p className="mt-1 text-2xl font-bold text-white">
              1 USD = {rate.usdToTry.toLocaleString('tr-TR')} ₺
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {new Date(rate.date).toLocaleDateString('tr-TR')} · Kaynak: {rate.source}
            </p>
          </div>
        )}

        {!rate && (
          <p className="text-amber-400">Henüz kur verisi yok. Aşağıdan TCMB'den çekin veya manuel girin.</p>
        )}

        <form onSubmit={handleSetRate} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-400">{error}</div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">Manuel kur girin (USD/TRY)</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="34.50"
                className="flex-1 rounded-lg border border-zinc-600 bg-zinc-700 px-4 py-2 text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
              >
                {updating ? 'Kaydediliyor...' : 'Güncelle'}
              </button>
            </div>
          </div>
        </form>

        <div>
          <button
            type="button"
            onClick={handleFetchFromTcmb}
            disabled={fetching}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            {fetching ? 'Çekiliyor...' : "TCMB'den kur çek"}
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            Türkiye Cumhuriyet Merkez Bankası'ndan güncel kur alınır.
          </p>
        </div>
      </div>
    </div>
  )
}
