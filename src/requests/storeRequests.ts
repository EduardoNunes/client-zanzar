import api from "../server/axios";
import { toast } from "react-toastify";

interface StoreDataProps {
  name: string;
  description: string;
  logo: File;
  banner: File;
  address?: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const createStoreReq = async (
  data: StoreDataProps,
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("logo", data.logo);
    formData.append("banner", data.banner);
    formData.append("profileId", profileId);

    if (data.address) {
      formData.append("address", JSON.stringify(data.address));
    }

    const response = await api.post("/store/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Erro ao criar loja.";
    throw new Error(errorMessage);
  }
};

export const getUserStoreReq = async (
  slug: string,
  token: string | null,
  profileId: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(`/store/${slug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        profileId,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar loja.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateBannerReq = async (
  profileId: string,
  file: File,
  token?: string | null,
  userStoreId?: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  if (!userStoreId) {
    toast.error("Vixe, algo deu errado, entre em contato com um adm.");
    return;
  }

  const formData = new FormData();
  formData.append("profileId", profileId);
  formData.append("banner", file);
  formData.append("userStoreId", userStoreId);

  try {
    const response = await api.post("/store/change-banner", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Banner atualizado com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar o banner.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateLogoReq = async (
  profileId: string,
  file: File,
  token?: string | null,
  userStoreId?: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  if (!userStoreId) {
    toast.error("Vixe, algo deu errado, entre em contato com um adm.");
    return;
  }

  const formData = new FormData();
  formData.append("profileId", profileId);
  formData.append("logo", file);
  formData.append("userStoreId", userStoreId);

  try {
    const response = await api.post("/store/change-logo", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Logo atualizado com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar o logo.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const favoriteStoreReq = async (
  profileId: string,
  storeId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  const payload = { profileId, storeId };

  try {
    const response = await api.post("/store/to-favorite-store", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao favoritar loja.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getStoreOrders = async (
  profileId: string,
  token: string,
  slug: string,
  page: number,
  limit: number
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(
      `/store/orders/${slug}?profileId=${profileId}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("RESPONSE", response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar pedidos.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateOrderStatus = async (
  orderItem: string,
  newStatus: string,
  token: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.put(
      `/store/orders/${orderItem}/status`,
      { newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar status do pedido.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getStoreBySlug = async (slug: string, token: string) => {
  try {
    const response = await api.get(`/store/is-my-store/${slug}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar loja:", error);
    throw new Error("Erro ao buscar loja.");
  }
};
