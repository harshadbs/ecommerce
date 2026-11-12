# Deploying (free tier)

| Part | Host | Free-plan limits |
|---|---|---|
| Postgres | [Neon](https://neon.com) | 0.5–1 GB storage, 100 CU-hours/month, sleeps when idle and wakes in about 1s |
| API (`backend/`) | [Render](https://render.com) free web service | 750 hrs/month, sleeps after 15 min idle (kept awake by a ping, see step 5) |
| Storefront (`frontend/web`) | [Vercel](https://vercel.com) Hobby | Non-commercial use only. Move to Netlify once you take real payments |
| Admin (`frontend/admin`) | Vercel Hobby | Same as above |

The order matters: the API and the frontends each need the other's URL.

## 1. Database (Neon)

1. Create a project and pick region **AWS Asia Pacific (Singapore)**, the same region as the API.
2. Under **Connect**, turn **Connection pooling off** and copy the connection string.
   Add `&connection_limit=5` to the end.
3. From your laptop, at the repo root, create the tables and seed them:
   ```bash
   export DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require&connection_limit=5"
   pnpm --filter @ecommerce/api db:deploy
   pnpm --filter @ecommerce/api db:seed
   ```
   The seed creates `admin@ecommerce.com` / `Admin@123`. **Change that password in step 6.**

   If this database was created earlier with `prisma db push`, mark the baseline as applied once
   before `db:deploy`, so only the newer migrations run:
   ```bash
   pnpm --filter @ecommerce/api exec prisma migrate resolve --applied 0_init
   ```

### Schema changes after that

Don't use `db:push` any more. Edit `backend/prisma/schema.prisma`, then create a migration locally:
```bash
pnpm --filter @ecommerce/api db:migrate --name <what_changed>
```
Commit the new `backend/prisma/migrations/<timestamp>_<what_changed>/` folder. Every Render build
runs `db:deploy` as its last step, so production applies it automatically on the next deploy.

## 2. API (Render)

1. **New → Blueprint** and pick this repo. Render reads `render.yaml`.
2. Fill in the prompted values:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon string from step 1 |
   | `API_URL` | `https://ecommerce-api.onrender.com` (use the URL Render shows) |
   | `APP_URL`, `ADMIN_URL` | `https://example.com` for now. These must be valid URLs or the API won't start. You'll set the real ones in step 4 |
   
   The JWT secrets are generated automatically, and `PORT` is set by Render.
3. Wait for the deploy, then open `https://<api>.onrender.com/api/health`. It should return `"success": true`.

## 3. Frontends (Vercel): one project each

| | Storefront | Admin |
|---|---|---|
| Root Directory | `frontend/web` | `frontend/admin` |
| Build command | from `frontend/web/vercel.json` (builds `@ecommerce/shared` first) | default (`next build`) |
| Env var | `NEXT_PUBLIC_API_URL=https://<api>.onrender.com/api` | same |

`NEXT_PUBLIC_API_URL` is baked in at build time. If you change it, redeploy.

## 4. Allow the frontends through CORS

In Render, set `APP_URL` and `ADMIN_URL` to the two Vercel production URLs. Use exact origins with no trailing slash. Render redeploys on save.
Requests from any other origin (including Vercel preview URLs) are blocked.

## 5. Keep the API awake

At [cron-job.org](https://cron-job.org) or UptimeRobot, add `GET https://<api>.onrender.com/api/health` every **10 min**.
One service running all month uses about 744 hours, which fits in the 750 free hours. The health route doesn't query the database, so Neon still sleeps and doesn't use up its compute hours.

## 6. Check everything works

- Log in to the admin panel, go to **Settings**, and change the admin password.
- Log in on the storefront and browse `/products`.
- **Check the proxy setting:** in Render **Logs**, each request line starts with the client IP. If it shows your real public IP, nothing to do. If it shows a `10.x` or Cloudflare address, set `TRUST_PROXY=2` in Render.

## Later

- **Images:** product images are stored in Postgres (`tbl_media`, about 100–200 KB each after the admin resizes them). Neon's free 0.5 GB covers a few thousand images. Beyond that, move them to Cloudinary.
- **Payments:** once Razorpay is live, move the storefront off Vercel Hobby, which forbids commercial use.
