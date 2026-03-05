# Mousepad Store — Frontend

Modern React + Vite frontend for testing the Mousepad Store backend.

## Features

- **Landing page**: Hero carousel, features strip, category links, featured products carousel, testimonials carousel, CTA section
- **Products page**: Filters (search, category, currency, sort), pagination, product grid
- **Product detail**: Full product info, USD/TRY toggle
- **Modern light theme**: Tailwind CSS, DM Sans & Outfit fonts, clean layout

## Setup

1. Ensure the backend is running on `http://localhost:3000`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open `http://localhost:4000`

## API Proxy

The Vite dev server proxies `/api` requests to the backend. No CORS configuration needed.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
