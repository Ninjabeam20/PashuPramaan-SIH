/** Returns the login token, or null so callers can omit Authorization and let the API use its farmer1 fallback. */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};
