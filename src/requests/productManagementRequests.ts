import api from "../server/axios";
import { toast } from "react-toastify";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  image_url: string;
}

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

export const createProductReq = async (data: ProductFormData) => {
  try {
    const response = await api.post("/products", data);
    toast.success("Produto criado com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao criar produto.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateProductReq = async (id: string, data: ProductFormData) => {
  try {
    const response = await api.put(`/products/${id}`, data);
    toast.success("Produto atualizado com sucesso!");
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
    toast.success("Produto deletado com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao deletar produto.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
