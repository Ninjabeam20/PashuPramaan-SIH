// Central API base URL — reads from env var in production, falls back to localhost in dev
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
