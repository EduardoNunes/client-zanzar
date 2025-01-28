import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const createPostWithMediaReq = async (
  userId: string,
  file: File,
  caption: string,
  filePath: string
) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filePath", filePath);
    formData.append("userId", userId);
    formData.append("caption", caption);

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
