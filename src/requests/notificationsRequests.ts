import api from "../server/axios";
import { toast } from "react-toastify";

export const getAllNotificationsReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(
      `/notifications/all-unread-notifications/${profileId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar feed.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getNotificationsReq = async (
  profileId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await api.get(
      `/notifications/read-all/${profileId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar notificações.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const markNotificationAsReadReq = async (notificationId: string) => {
  try {
    const response = await api.post(
      `/notifications/${notificationId}/mark-as-read`
    );
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao marcar notificação como lida.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const markAllNotificationsAsReadReq = async (
  profileId: string,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      `/notifications/mark-all-read/${profileId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      "Erro ao marcar todas notificações como lidas.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};