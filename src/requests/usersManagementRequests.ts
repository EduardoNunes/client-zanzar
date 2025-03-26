import api from "../server/axios";
import { toast } from "react-toastify";

export interface UserProfile {
  id: string;
  username: string;
  role: string;
  lastSignInAt: string;
  createdAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers24h: number;
  activeUsers7d: number;
  activeUsers30d: number;
}

export interface PaginatedResponse {
  users: UserProfile[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const getUsersCountReq = async (
  token: string | null
): Promise<{ count: number }> => {
  try {
    const response = await api.get("/admin/users/stats/total", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getUsersCountReq:", error);
    toast.error("Failed to fetch total users count");
    throw error;
  }
};

export const getActiveUsers24hReq = async (
  token: string | null
): Promise<{ count: number }> => {
  try {
    const response = await api.get("/admin/users/stats/24h", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getActiveUsers24hReq:", error);
    toast.error("Failed to fetch 24h active users");
    throw error;
  }
};

export const getActiveUsers7dReq = async (
  token: string | null
): Promise<{ count: number }> => {
  try {
    const response = await api.get("/admin/users/stats/7d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getActiveUsers7dReq:", error);
    toast.error("Failed to fetch 7d active users");
    throw error;
  }
};

export const getActiveUsers30dReq = async (
  token: string | null
): Promise<{ count: number }> => {
  try {
    const response = await api.get("/admin/users/stats/30d", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getActiveUsers30dReq:", error);
    toast.error("Failed to fetch 30d active users");
    throw error;
  }
};

export const getAllUsersReq = async (
  page: number = 1,
  token: string | null
): Promise<PaginatedResponse> => {
  try {
    const response = await api.get(`/admin/users?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getAllUsersReq:", error);
    toast.error("Failed to fetch users");
    throw error;
  }
};
