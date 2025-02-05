import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const getProfileReq = async (username: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const { data } = await api.get(`/profile/user-profile/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const getPostsReq = async (
  username: string,
  page: number,
  limit: number
) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }
  try {
    const response = await api.get(`/profile/user-posts/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: page,
        limit: limit,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar posts.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const updateProfileImageReq = async (profileId: string, file: File) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  const formData = new FormData();
  formData.append("profileId", profileId);
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

export const followProfileReq = async (
  profileId: string,
  currentProfileId: string
) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  const payload = { profileId, currentProfileId };

  try {
    const response = await api.post("/profile/follow-profile", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success("Sucesso!");
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao seguir perfil.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
