import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const getInvitesReq = async () => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get("/invites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
console.log("RESPONSE", response.data)
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar feed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export const sendInvitesReq = async (email: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }
  try {
    const response = await api.post("/invites/send-invite", { email }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar feed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}