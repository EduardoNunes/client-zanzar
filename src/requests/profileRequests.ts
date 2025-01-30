import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const getProfileReq = async (userId: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const { data } = await api.get(`/profile/user-profile/${userId}`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const getPostsReq = async (userId: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(`/profile/user-posts/${userId}`);

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const updateProfileImage = async (userId: string, file: File) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("avatar", file);

  try {
    const response = await api.post("/profile/profile-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Imagem de perfil atualizada com sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar a imagem de perfil.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
