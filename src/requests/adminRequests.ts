import api from "../server/axios";
import { toast } from "react-toastify";

interface CountResponse {
  count: number;
}

export const getPostsCountReq = async (
  token: string | null
): Promise<CountResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return { count: 0 };
  }

  try {
    const response = await api.get("/admin/posts/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de posts.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getProductsCountReq = async (
  token: string | null
): Promise<CountResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return { count: 0 };
  }

  try {
    const response = await api.get("/admin/products/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de produtos.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMessagesCountReq = async (
  token: string | null
): Promise<CountResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return { count: 0 };
  }

  try {
    const response = await api.get("/admin/messages/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de mensagens.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAdsCountReq = async (
  token: string | null
): Promise<CountResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return { count: 0 };
  }

  try {
    const response = await api.get("/admin/advertisements/count", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de anúncios.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export interface TotalUser {
  username: string;
  last_sign_in_at: string;
}

export const getTotalUsersReq = async (
  token: string | null
): Promise<CountResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return { count: 0 };
  }

  try {
    const response = await api.get("/admin/users/total", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar usuários recentes.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
