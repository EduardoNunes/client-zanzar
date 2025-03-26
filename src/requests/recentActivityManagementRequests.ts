import api from "../server/axios";
import { toast } from "react-toastify";

export interface UserActivity {
  id: string;
  username: string;
  last_sign_in_at: string;
  created_at: string;
  total_posts: number;
  total_messages: number;
  total_likes: number;
}

export interface ActivityStats {
  totalActiveToday: number;
  totalActiveWeek: number;
  averageSessionsPerDay: number;
}

export const getUsersActivityReq = async (
  token: string | null
): Promise<UserActivity[]> => {
  if (!token) {
    toast.error("Usuário não autenticado");
    return [];
  }

  try {
    const response = await api.get("/admin/activity/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getUsersActivityReq:", error);
    toast.error("Failed to fetch user activity");
    throw error;
  }
};

export const getActivityStatsReq = async (
  token: string | null
): Promise<ActivityStats> => {
  if (!token) {
    toast.error("Usuário não autenticado");
    return {
      totalActiveToday: 0,
      totalActiveWeek: 0,
      averageSessionsPerDay: 0,
    };
  }

  try {
    const response = await api.get("/admin/activity/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getActivityStatsReq:", error);
    toast.error("Failed to fetch activity stats");
    throw error;
  }
};
