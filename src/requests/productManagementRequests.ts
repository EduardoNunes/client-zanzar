import api from "../server/axios";
import { toast } from "react-toastify";

export const fetchProductsReq = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar produtos.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const createProductReq = async (product: any) => {
  try {
    const response = await api.post("/products", product);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao criar produto.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateProductReq = async (id: string, product: any) => {
  try {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar produto.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const deleteProductReq = async (id: string) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao deletar produto.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
