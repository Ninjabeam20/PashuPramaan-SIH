/** Browser-facing FastAPI origin. Local default; set NEXT_PUBLIC_API_URL on Vercel. */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/$/,
  "",
);
