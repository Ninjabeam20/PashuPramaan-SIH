# Deploy the main app (branch `deploy/vercel-render`)

Leave **`main`** and the existing verifier project alone.

**Already live (do not retarget):** [pashu-verifier.vercel.app](https://pashu-verifier.vercel.app) — Root Directory must stay `pashu-verifier`.

## 1. Backend on Render

1. Push `deploy/vercel-render`.
2. [Render](https://dashboard.render.com) → **New** → **Blueprint** → this GitHub repo → branch **`deploy/vercel-render`**.
3. After the web service exists, add env vars (same values as local `.env`, not committed):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Confirm `VERIFY_PUBLIC_BASE_URL` is `https://pashu-verifier.vercel.app`.
5. Open `https://<service>.onrender.com/health` — expect `{"status":"ok"}`.

Free web services sleep after idle; the first request can take ~30s.

## 2. Frontend on Vercel (new project)

1. Vercel → **Add New** → **Project** → same GitHub repo.
2. **Root Directory:** leave empty (repo root Next.js app). Do **not** pick `pashu-verifier`.
3. **Production Branch:** `deploy/vercel-render` (not `main`).
4. Env var for Production and Preview:
   - `NEXT_PUBLIC_API_URL` = `https://<service>.onrender.com` (no trailing slash)
5. Deploy.

## 3. Local still works

Unset `NEXT_PUBLIC_API_URL` → frontend keeps using `http://localhost:8000`.
