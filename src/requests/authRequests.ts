import api from "../server/axios";

export const loginUserReq = async (email: string, password: string) => {
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
    const errorMessage = error.response?.data?.message || "Erro ao logar.";
    throw new Error(errorMessage);
  }
};
