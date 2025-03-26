import api from "../server/axios";
import { toast } from "react-toastify";

export const createPostWithMediaReq = async (
  profileId: string,
  file: File,
  caption: string,
  filePath: string,
  selectedCategory: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  const allowedImageTypes = ["image/jpeg", "image/jpg"];
  const allowedVideoTypes = ["video/mp4"];

  if (
    !allowedImageTypes.includes(file.type) &&
    !allowedVideoTypes.includes(file.type)
  ) {
    toast.error(
      "Formato de arquivo não suportado. Apenas JPG, JPEG e MP4 são permitidos."
    );
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filePath", filePath);
    formData.append("profileId", profileId);
    formData.append("caption", caption);
    formData.append("selectedCategory", selectedCategory);

    const response = await api.post("/posts/upload-and-create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Postagem criada com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao criar a postagem. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};

export const loadCategoriesReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/posts/load-categories", {
      params: { profileId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao criar a postagem. Tente novamente.";

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
      "/posts/category",
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
      "Erro ao criar a postagem. Tente novamente.";

    console.error("Error:", error);
    throw new Error(errorMessage);
  }
};
