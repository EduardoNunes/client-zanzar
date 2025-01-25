export const loginUserReq = async (email: string, password: string) => {
  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer login.");
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || "Erro inesperado.");
  }
};
