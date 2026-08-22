export const loginUser = async (role: string, userId: string, _password: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ role, userId, name: "Dummy User" });
    }, 500);
  });
};
