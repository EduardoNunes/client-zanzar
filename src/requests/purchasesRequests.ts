import api from "../server/axios";

export const getUserPurchasesReq = async (
  profileId: string,
  token: string | null,
  page: number,
  limit: number
) => {
  if (!token) {
    console.log("Token de acesso não encontrado.");
    return;
  }
  try {
    const { data } = await api.get(`/purchases/get-user-purchases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        profileId,
        page,
        limit,
      },
    });

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar compras.";
    throw new Error(errorMessage);
  }
};
