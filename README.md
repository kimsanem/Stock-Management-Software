# Mall Inventory & POS System

Retail + wholesale inventory management with admin dashboard.

## Stack
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind + shadcn-style UI
- **Auth:** JWT + bcrypt, role-based (ADMIN / CASHIER / MANAGER)

## Free Hosting
| Part | Service | Notes |
|---|---|---|
| DB | [Neon](https://neon.tech) | Free tier, 3GB, serverless Postgres |
| Backend | [Render](https://render.com) | Free web service (sleeps after 15m idle) |
| Frontend | [Vercel](https://vercel.com) | Free, auto-deploys from Git |

## Quick start (local)

```bash
# 1. Database — create a free Neon project, copy the connection string
# 2. Backend
cd backend
cp .env.example .env        # paste DATABASE_URL + set JWT_SECRET
npm install
npx prisma migrate dev
npm run seed                # creates default admin: admin@mall.local / admin123
npm run start:dev           # http://localhost:3001

# 3. Frontend
cd ../frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

## Features
- Products with **retail & wholesale** pricing, stock tracking
- Customer CRUD (name, phone, address, purchase history)
- Atomic sale transactions (stock decrement + sale + items in one DB transaction)
- Stock movement audit log (every change tracked: who, when, why)
- Responsive admin dashboard
- Role-based access control

## Project layout
```
backend/    NestJS API
frontend/   Next.js admin dashboard
```
