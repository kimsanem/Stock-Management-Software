# Deployment (100% Free)

## 1. Database — Neon (free, 3GB, serverless Postgres)

1. Sign up at https://neon.tech
2. Create a new project (pick the region closest to you).
3. Copy the **connection string** (Dashboard → "Connection Details" → `postgresql://...`).
4. Keep it — you'll paste it as `DATABASE_URL` in both Render and local `.env`.

## 2. Backend — Render (free web service)

1. Push this repo to GitHub.
2. Sign up at https://render.com, click **New → Blueprint**, pick your repo.
3. Render will detect `backend/render.yaml`. It will prompt for secrets:
   - `DATABASE_URL` — paste the Neon connection string
   - `CORS_ORIGIN` — will set after step 3 (use `*` temporarily)
4. Deploy. First build runs Prisma migrations automatically.
5. After deploy, seed the admin user once via the Render shell:
   ```
   npm run seed
   ```
6. Note your backend URL, e.g. `https://mall-backend.onrender.com`.

> Free tier note: Render free web services sleep after 15 min idle (≈30s cold start on wake). Fine for demo/small shop use.

## 3. Frontend — Vercel (free)

1. Sign up at https://vercel.com and import the same repo.
2. Set **Root Directory** → `frontend`.
3. Add env var: `NEXT_PUBLIC_API_URL` = `https://mall-backend.onrender.com/api`
4. Deploy.

## 4. Finalize CORS

Back on Render, set `CORS_ORIGIN` to your Vercel URL (e.g. `https://mall.vercel.app`) and redeploy.

## 5. Log in

- Email: `admin@mall.local`
- Password: `admin123`
- **Change this immediately** via the API (or add a user-management page).

## Alternatives
- **Backend sleep bothering you?** Use [Fly.io](https://fly.io) free tier instead — always on.
- **Want all-in-one?** Swap Neon for [Supabase](https://supabase.com) (Postgres + auth + storage in one dashboard).
