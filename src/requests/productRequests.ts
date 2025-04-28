import { toast } from "react-toastify";
import api from "../server/axios";
import { ProductVariationsProps } from "../types/ProductVariant";

export const addProductReq = async (
  name: string | null,
  description: string | null,
  selectedCategory: string,
  selectedSubCategory: string,
  variants: ProductVariationsProps[],
  token: string | null,
  profileId: string | null,
  userStoreId: string | undefined
) => {
  if (!userStoreId) {
    toast.error("Ops, algo deu errado, entre em contato com um adm.");
    return null;
  }

  const productLoadingToast = toast.loading("Criando produto, aguarde...");

  // Monta o FormData para envio multipart/form-data
  const formData = new FormData();

  formData.append("name", name ?? '');
  formData.append("description", description ?? '');
  formData.append("selectedCategory", selectedCategory);
  formData.append("selectedSubCategory", selectedSubCategory);
  formData.append("userStoreId", userStoreId);
  formData.append("profileId", profileId ?? '');

  variants.forEach((variant, variantIndex) => {
    formData.append(`variants[${variantIndex}][colorName]`, variant.colorName);
    formData.append(`variants[${variantIndex}][colorCode]`, variant.colorCode);

    // Sizes
    variant.sizes.forEach((size, sizeIndex) => {
      formData.append(`variants[${variantIndex}][sizes][${sizeIndex}][size]`, size.size);
      formData.append(`variants[${variantIndex}][sizes][${sizeIndex}][stock]`, size.stock.toString());
      formData.append(`variants[${variantIndex}][sizes][${sizeIndex}][basePrice]`, size.basePrice.toString());
      formData.append(`variants[${variantIndex}][sizes][${sizeIndex}][price]`, size.price.toString());
    });

    // Images
    variant.images.forEach((image, imageIndex) => {
      if (image.file) {
        formData.append(`variants[${variantIndex}][images][${imageIndex}]`, image.file);
      }
      formData.append(`variants[${variantIndex}][images][${imageIndex}][position]`, image.position.toString());
    });
  });

  try {
    const response = await api.post("/product/add-product", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Produto criado com sucesso!");
    return response.data;
  } catch (error: any) {
    console.error("Error sending product data:", error);
    toast.error(
      error.response?.data?.message || "Error sending product information"
    );
    return null;
  } finally {
    toast.dismiss(productLoadingToast);
  }
};


export const loadProductsReq = async (
  userStoreId: string,
  page: number,
  token: string | null,
  profileId: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/product/load-products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userStoreId,
        page,
        profileId,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao carregar produtos. Tente novamente.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export const loadCategoriesReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/product/load-categories", {
      params: { profileId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao carregar categorias. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const createCategoryReq = async (
  newCategory: string,
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/product/create-category",
      { newCategory, profileId },
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
      "Erro ao criar categoria. Tente novamente.";
    toast.error(errorMessage);
    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const loadSubCategoriesReq = async (
  profileId: string,
  token: string | null,
  categoryId: string
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/product/load-sub-categories", {
      params: { profileId, categoryId },
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

export const createSubCategoryReq = async (
  newSubCategory: string,
  categoryId: string,
  profileId: string,
  token: string | null,
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/product/create-sub-category",
      { newSubCategory, categoryId, profileId },
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
      "Erro ao criar a subcategoria. Tente novamente.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

