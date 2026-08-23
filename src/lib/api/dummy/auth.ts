export const loginUser = async (role: string, userId: string, password: string) => {
  const res = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: userId, password, role })
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  // Ensure token is saved for getToken to use
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
  }
  return { role, userId, name: data.farmer?.name || "Dummy User" };
};
