import { toast } from "react-toastify";
import api from "../server/axios";

export const getCartProductsReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/user-cart/get-cart-products", {
      params: { profileId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao carregar subcategorias. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const addToCartReq = async (
  profileId: string,
  productId: string,
  variationId: string,
  size: string,
  quantity: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/user-cart/add-to-cart",
      {
        profileId,
        productId,
        variation: variationId,
        size,
        quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success("Produto adicionado ao carrinho com sucesso!");
    return response.data;
  } catch (error: any) {
    toast.info(error.response.data.message);
  }
};

interface SelectedProductsProps {
  productVariantSizeId: string;
  quantity: number;
}

export const removeFromCartReq = async (
  profileId: string,
  productId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.delete("/user-cart/remove-from-cart", {
      data: { profileId, itemId: productId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Produto removido do carrinho");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao remover produto do carrinho. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const updateCartQuantityReq = async (
  profileId: string,
  productId: string,
  quantity: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.put(
      "/user-cart/update-cart-quantity",
      { profileId, productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao atualizar quantidade. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const orderBuyProductsReq = async (
  profileId: string,
  token: string | null,
  selectedProducts: SelectedProductsProps[]
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/user-cart/buy-products",
      { profileId, selectedProducts },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao realizar a compra. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};
