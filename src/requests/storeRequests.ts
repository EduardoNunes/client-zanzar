import api from "../server/axios";
import { toast } from "react-toastify";

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
