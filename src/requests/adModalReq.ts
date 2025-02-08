import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  linkUrl: string | null;
  showOnStartup: boolean;
  startDate: string;
  endDate: string;
  dailyLimit?: number;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export const getEligibleAdReq = async (profileId?: string): Promise<Advertisement | null> => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Access token not found.");
    return null;
  }

  try {
    const response = await api.get("/ad-modal/eligible", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      params: {
        profileId,
        showOnStartup: true,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching eligible ad:", error);
    toast.error(error.response?.data?.message || "Error fetching advertisement");
    return null;
  }
};

export const recordAdViewReq = async (adId: string, profileId?: string) => {
  const token = Cookies.get("access_token");

  if (!token) {
    toast.error("Access token not found.");
    return;
  }

  try {
    await api.post(
      "/ad-modal/view",
      { adId, profileId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error recording ad view:", error);
    toast.error(error.response?.data?.message || "Error recording ad view");
  }
};

export const recordAdClickReq = async (adId: string, profileId?: string) => {
  const token = Cookies.get("access_token");
console.log("CHEGOU3")
  if (!token) {
    toast.error("Access token not found.");
    return;
  }

  try {
    await api.post(
      "/ad-modal/click",
      { adId, profileId },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Error recording ad click:", error);
    toast.error(error.response?.data?.message || "Error recording ad click");
  }
};