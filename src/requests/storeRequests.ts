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

export const createStoreReq = async (data: StoreDataProps, profileId: string, token: string | null) => {
  console.log("TOKEN", token)
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

export const getUserStoreReq = async (slug: string, token: string | null, profileId: string) => {
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
        profileId: profileId,
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

export const loadStoreProductsReq = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar produtos da loja.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
