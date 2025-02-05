import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const getFeedReq = async (
  profileId: string,
  page: number,
  limit: number
) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/posts/get-all", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        profileId: profileId,
        page: page,
        limit: limit,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar feed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const handleLikeReq = async (postId: string, profileId: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/posts/likes",
      { postId, profileId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao curtir postagem.";
    throw new Error(errorMessage);
  }
};

export const newCommentReq = async (
  postId: string,
  profileId: string,
  content: string
) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/posts/comments",
      { postId, profileId, content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao postar comentário.";
    throw new Error(errorMessage);
  }
};

export const get15commentsReq = async (postId: string, page: number = 1) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/posts/comments", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        postId,
        page,
        limit: 15,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar comentários.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
