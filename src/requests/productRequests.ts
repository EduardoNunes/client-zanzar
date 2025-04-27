import { toast } from "react-toastify";
import api from "../server/axios";

type FilteredVariants = {
  color: string;
  size: string;
  stock: number;
  price: number;
  priceWithTax: number;
  images: File[];
  added: boolean;
};

export const addProductReq = async (
  name: string | null,
  description: string | null,
  selectedCategory: string,
  selectedSubCategory: string,
  filteredVariants: FilteredVariants[],
  token: string | null,
  profileId: string | null,
  userStoreId: string | undefined
) => {
  if (!userStoreId) {
    toast.error("Ops, algo deu errado, entre em contato com um adm.");
    return null;
  }

  const productLoadingToast = toast.loading("Criando produto, aguarde...");

  const formData = new FormData();

  formData.append("name", name || "");
  formData.append("description", description || "");
  formData.append("selectedCategory", selectedCategory || "");
  formData.append("selectedSubCategory", selectedSubCategory || "");
  formData.append("profileId", profileId || "");
  formData.append("userStoreId", userStoreId || "");

  filteredVariants.forEach((variant, index) => {
    formData.append(`variants[${index}][color]`, variant.color);
    formData.append(`variants[${index}][price]`, variant.price.toString());
    formData.append(`variants[${index}][size]`, variant.size);
    formData.append(`variants[${index}][stock]`, variant.stock.toString());

    if (variant.images && variant.images.length > 0) {
      variant.images.forEach((image: File) => {
        formData.append(`variants[${index}][images][]`, image);
      });
    }
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

