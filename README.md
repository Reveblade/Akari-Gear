# Mousepad Store - Backend API

Three-tier architecture backend for a classic web store. Built with Express, TypeScript, and MongoDB.

## Features

- **Email authentication** – Register, login, email verification, password reset
- **Categories** – Extensible product categories (Mousepads now, more via admin later)
- **Products** – Full CRUD with category association
- **Admin API** – Protected routes for category/product management

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer (SMTP)
- **Validation:** express-validator

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `MONGODB_URI` – MongoDB connection string
- `JWT_SECRET` – Secret for JWT signing
- `SMTP_*` – Email config (use [Mailtrap](https://mailtrap.io) for dev)

### 3. Run MongoDB

Ensure MongoDB is running locally or use a cloud instance (e.g. MongoDB Atlas).

### 4. Seed (optional)

Create admin user and initial Mousepads category:

```bash
npm run seed
```

Default admin: `admin@mousepad-store.com` / `Admin123!`

Override with env vars:
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

### 5. Start server

```bash
npm run dev
```

API: `http://localhost:3000`

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-email` | Verify email (body: `{ token }`) |
| POST | `/api/auth/resend-verification` | Resend verification (body: `{ email }`) |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password (body: `{ token, password }`) |
| GET | `/api/auth/me` | Current user (requires `Authorization: Bearer <token>`) |
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:slug` | Get category |
| GET | `/api/products` | List products (`?category=&search=&page=&limit=`) |
| GET | `/api/products/:slug` | Get product |

### Admin (requires `Authorization: Bearer <token>` + admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/categories` | List all categories (`?active=false` for inactive) |
| GET | `/api/admin/categories/:slug` | Get category (by slug or ID) |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/products` | List all products (`?active=false` for inactive) |
| GET | `/api/admin/products/:slug` | Get product |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| POST | `/api/admin/admins` | Create admin (body: `{ email, password }`) |

## Project Structure

```
backend/
├── src/
│   ├── config/         # App configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, etc.
│   ├── models/         # Mongoose models
│   ├── routes/         # Public + admin routes
│   ├── services/       # Email, etc.
│   ├── validators/     # express-validator rules
│   ├── app.ts          # Express app
│   └── server.ts       # Entry point
├── scripts/
│   └── seed.ts         # DB seed
└── package.json
```
