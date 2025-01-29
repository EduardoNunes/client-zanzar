import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const getFeedReq = async (userId: string) => {
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
        userId: userId,
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

export const handleLikeReq = async (postId: string, userId: string) => {
  const token = Cookies.get("access_token");
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }
  try {
    const response = await api.post(
      "/posts/likes",
      { postId, userId },
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
      error.response?.data?.message || "Erro ao buscar feed.";
    throw new Error(errorMessage);
  }
};

export const handleCommentReq = async (
  postId: string,
  userId: string,
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
      { postId, userId, content },
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
      error.response?.data?.message || "Erro ao buscar feed.";
    throw new Error(errorMessage);
  }
};
