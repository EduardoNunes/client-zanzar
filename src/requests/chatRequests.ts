import api from "../server/axios";
import { toast } from "react-toastify";

export const getUsersSearchReq = async (
  userName: string,
  token: string | null
) => {
  if (!userName) {
    toast.error("O nome de usuário não pode estar vazio.");
    return [];
  }
  const formattedUsername = userName.toLowerCase().trim().replace(/\s+/g, "_");
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return [];
  }
  try {
    const { data } = await api.get(
      `/chat/search-users?userName=${formattedUsername}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar usuários.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getFollowedUsersReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const { data } = await api.get(`/chat/followed-users/${profileId}`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao encontrar usuários.";
    throw new Error(errorMessage);
  }
};

export const getUserChatsReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const { data } = await api.get(`/chat/user-chats/${profileId}`);

    return data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar chats.";
    throw new Error(errorMessage);
  }
};

export const createChatReq = async (
  nameChat: string,
  profileId: string,
  selectedProfileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(`/chat/create-chat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        nameChat,
        profileId,
        selectedProfileId,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Erro ao criar chat.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMessagesReq = async (
  conversationId: string,
  limit: number,
  offset: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(
      `/chat/conversation/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit, offset },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar chats.";
    throw new Error(errorMessage);
  }
};
