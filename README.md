# Admin Panel — Akari Gear

Admin paneli ayrı bir uygulama olarak çalışır (port 5000).

## Geliştirme

```bash
# Bağımlılıkları yükle (ilk sefer)
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Backend (port 3000) ve mağaza (port 4000) çalışırken admin paneli `http://localhost:5000` adresinde açılır.

## Ortam Değişkenleri

- `VITE_FRONTEND_URL` — Mağaza URL'i (varsayılan: http://localhost:4000). "Mağazaya Dön" linki için kullanılır.

## Build

```bash
npm run build
```
