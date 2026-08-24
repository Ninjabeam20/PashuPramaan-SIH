# PashuPramaan public verifier

Standalone Next.js app for `/verify/[passportId]`. This folder is the **only** part of the repo that should be deployed to Vercel.

The farmer/lab app and FastAPI stay local. Lab verification updates hosted Supabase; this site reads Supabase on each request. A verification does **not** require a GitHub commit or a Vercel redeploy.

## Vercel

Create a **new** project (do not import the repo root as the app):

- Git repository: `Ninjabeam20/PashuPramaan-SIH`
- **Root Directory:** `pashu-verifier`
- Framework: Next.js
- Ignored Build Step: `git diff --quiet HEAD^ HEAD -- pashu-verifier && exit 0 || exit 1`
- **Deployment Protection:** off for Production (otherwise a phone scan hits a Vercel login wall)

Environment variables (Production, Preview, and Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://kznydayavtwhinkdzbfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Do not add `SUPABASE_SERVICE_ROLE_KEY` here. Do not use the `/rest/v1/` suffix on the URL.

After the first production URL exists, set repo-root `.env` `VERIFY_PUBLIC_BASE_URL` to that origin (no trailing slash) and restart FastAPI so new QRs encode the live link.

## Local

Copy `.env.example` to `.env.local` and fill the anon key.

```
npm install
npm run dev
```

Runs on port 3001. Open `http://localhost:3001/verify/<passportId>`.
