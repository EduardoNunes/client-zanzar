import api from "../server/axios";

export const registerUserReq = async (email: string, password: string, username: string) => {
  try {
    const response = await api.post("/register", { email, password, username });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || "Erro ao cadastrar.";
    throw new Error(errorMessage);
  }
};
