import api from "../server/axios";
import { toast } from "react-toastify";

export const createCustomerAsaasReq = async (
  profileId: string,
  token: string,
  completeData: any
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      `/asaas/create-customer/${profileId}`,
      completeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const orderPaymentAsaasReq = async (
  profileId: string,
  token: string,
  value: number,
  orderIdZanzar: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      `/asaas/create-payment-order/${profileId}`,
      { value, orderIdZanzar },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao criar pagamento.";
    throw new Error(errorMessage);
  }
};
