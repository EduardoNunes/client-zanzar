import api from "../server/axios";

export const loginUserReq = async (email: string, password: string) => {
  console.log("REQUEST", email, password);
  try {
    const response = await api.post(
      "/auth/login",
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Erro inesperado.");
  }
};
