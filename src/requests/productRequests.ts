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
  categoryName: string,
  filteredVariants: FilteredVariants[],
  token: string | null,
  profileId: string | null,
  userStoreId: string | undefined
) => {
  if (!token) {
    toast.error("Access token not found.");
    return null;
  }

  const formData = new FormData();

  formData.append("name", name || "");
  formData.append("description", description || "");
  formData.append("categoryName", categoryName);
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

  for (const pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  try {
    const response = await api.post("/product/add-product", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error sending product data:", error);
    toast.error(
      error.response?.data?.message || "Error sending product information"
    );
    return null;
  }
};

