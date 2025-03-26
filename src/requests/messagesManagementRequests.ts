import api from "../server/axios";
import { toast } from "react-toastify";

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: string;
  receiver: string | string[];
}

export interface MessageStats {
  totalMessages: number;
  messages24h: number;
  messages7d: number;
  messages30d: number;
}

export interface PaginatedResponse {
  messages: Message[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const getMessagesCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/messages/stats/total", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de mensagens.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMessages24hCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/messages/stats/24h", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao buscar mensagens das últimas 24h.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMessages7dCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/messages/stats/7d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao buscar mensagens dos últimos 7 dias.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getMessages30dCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/messages/stats/30d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao buscar mensagens dos últimos 30 dias.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAllMessagesReq = async (
  page: number = 1,
  token: string | null
): Promise<PaginatedResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return {
      messages: [],
      pagination: {
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  }

  try {
    const response = await api.get("/admin/messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar mensagens.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
