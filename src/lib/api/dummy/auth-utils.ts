export const getToken = () => {
  if (typeof window !== "undefined") {
    // We can get token from local storage or context. 
    // Wait, let's just return a fixed farmer token since we aren't storing it anywhere yet.
    // Or check localStorage for mock token.
    return localStorage.getItem("token") || "farmer1_id:FARMER";
  }
  return "farmer1_id:FARMER";
};
