import api from "../server/axios";
import { toast } from "react-toastify";

export const getSinglePostReq = async (
  postId: string,
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/posts/get-single", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        postId: postId,
        profileId: profileId,
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
