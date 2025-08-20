import api from "../server/axios";
import { toast } from "react-toastify";

export const getProfileReq = async (username: string, token: string | null) => {
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
  token: string | null,
  profileId: string
) => {
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
        profileId: profileId,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const updateProfileImageReq = async (
  profileId: string,
  file: File,
  token?: string | null
) => {
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
  currentProfileId: string,
  token: string | null
) => {
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

export const getPostsByCategoryReq = async (
  categoryId: string,
  profileId: string,
  page: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(`/profile/posts-by-category`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: page,
        profileId: profileId,
        categoryId,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const getUserDataReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    throw new Error("Token de acesso não encontrado.");
  }

  try {
    const response = await api.get(
      `/profile/get-user-data?profileId=${profileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar dados.";
    throw new Error(errorMessage);
  }
};

export const updateUserDataReq = async (
  profileId: string,
  completeData: any,
  token: string
) => {
  if (!token) {
    throw new Error("Token de acesso não encontrado.");
  }

  try {
    const response = await api.put(
      `/profile/update-user-data/${profileId}`,
      completeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar dados.";
    throw new Error(errorMessage);
  }
};

export const updateUsernameReq = async (
  profileId: string,
  newUsername: string,
  token: string
) => {
  if (!token) {
    throw new Error("Token de acesso não encontrado.");
  }

  try {
    const response = await api.put(
      `/profile/update-username/${profileId}`,
      { newUsername },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao atualizar username.";
    throw new Error(errorMessage);
  }
}
