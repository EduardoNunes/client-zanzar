import api from "../server/axios";
import { toast } from "react-toastify";

export interface Post {
  id: string;
  mediaUrl: string;
  caption: string;
  createdAt: string;
  profile: {
    username: string;
  };
  likes: {
    id: string;
  }[];
  comments: {
    id: string;
  }[];
}

export interface PaginatedResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const getPostsCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/posts/total", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar total de posts.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getPosts24hCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/posts/24h", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar posts das últimas 24h.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getPosts7dCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/posts/7d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao buscar posts dos últimos 7 dias.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getPosts30dCountReq = async (token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return 0;
  }

  try {
    const response = await api.get("/admin/posts/30d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.count;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao buscar posts dos últimos 30 dias.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAllPostsReq = async (
  page: number = 1,
  token: string | null
): Promise<PaginatedResponse> => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return {
      posts: [],
      pagination: {
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    };
  }

  try {
    const response = await api.get("/admin/posts/all", {
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
      error.response?.data?.message || "Erro ao buscar posts.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
