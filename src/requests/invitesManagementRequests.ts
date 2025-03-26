import api from "../server/axios";
import { toast } from "react-toastify";

export const getAllInvitesReq = async (
  page: number = 1,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.get(`/invite-management?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar convites.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const grantInviteReq = async (
  username: string,
  inviteCount: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/invite-management/invites-to-one",
      { username, inviteCount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar convites.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const sendInvitesToAllUsersReq = async (
  inviteCount: number,
  token: string | null
) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.post(
      "/invite-management/invites-to-all",
      { inviteCount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao buscar convites.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const revokeInviteReq = async (id: string, token: string | null) => {
  if (!token) {
    toast.error("Token de acesso não encontrado.");
    return;
  }

  try {
    const response = await api.delete(
      `/invite-management/remove-invite/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || "Erro ao revogar convite.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};
