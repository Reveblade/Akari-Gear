import { useState, useEffect } from 'react'

export interface AddressData {
  fullName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  address: string
  postalCode: string
}

const initialAddress: AddressData = {
  fullName: '',
  phone: '',
  city: '',
  district: '',
  neighborhood: '',
  address: '',
  postalCode: '',
}

interface AddressFormProps {
  value?: Partial<AddressData>
  onChange?: (data: AddressData) => void
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  const [data, setData] = useState<AddressData>({ ...initialAddress, ...value })

  useEffect(() => {
    if (value && Object.keys(value).some((k) => (value as Record<string, string>)[k])) {
      setData((prev) => ({ ...prev, ...value }))
    }
  }, [value])

  const update = (field: keyof AddressData, val: string) => {
    const next = { ...data, [field]: val }
    setData(next)
    onChange?.(next)
  }

  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 dark:border-zinc-600 dark:bg-zinc-800">
      <h3 className="font-display text-lg font-semibold text-surface-800 dark:text-zinc-100">
        Teslimat Adresi
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-zinc-400">
        Siparişinizin teslim edileceği adres bilgilerini girin.
      </p>
      <form className="mt-4 space-y-3">
        <div>
          <label htmlFor="address-fullName" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
            Ad Soyad
          </label>
          <input
            id="address-fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            placeholder="Adınız Soyadınız"
            className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="address-phone" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
            Telefon
          </label>
          <input
            id="address-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="05XX XXX XX XX"
            className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="address-city" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              İl
            </label>
            <input
              id="address-city"
              type="text"
              value={data.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="İl"
              className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="address-district" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
              İlçe
            </label>
            <input
              id="address-district"
              type="text"
              value={data.district}
              onChange={(e) => update('district', e.target.value)}
              placeholder="İlçe"
              className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
        <div>
          <label htmlFor="address-neighborhood" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
            Mahalle / Sokak
          </label>
          <input
            id="address-neighborhood"
            type="text"
            value={data.neighborhood}
            onChange={(e) => update('neighborhood', e.target.value)}
            placeholder="Mahalle, sokak adı"
            className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="address-address" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
            Adres
          </label>
          <textarea
            id="address-address"
            rows={2}
            value={data.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Bina no, daire no, kat vb."
            className="mt-1 w-full resize-none rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="address-postalCode" className="block text-sm font-medium text-surface-700 dark:text-zinc-300">
            Posta Kodu <span className="text-surface-400 dark:text-zinc-500">(opsiyonel)</span>
          </label>
          <input
            id="address-postalCode"
            type="text"
            value={data.postalCode}
            onChange={(e) => update('postalCode', e.target.value)}
            placeholder="34000"
            className="mt-1 w-full rounded-lg border border-surface-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
      </form>
    </div>
  )
}
