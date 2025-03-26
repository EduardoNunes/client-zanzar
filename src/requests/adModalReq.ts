import api from "../server/axios";
import { toast } from "react-toastify";

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  linkUrl: string | null;
  showOnStartup: boolean;
  startDate: string;
  endDate: string;
  dailyLimit?: number;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export const getEligibleAdReq = async (
  profileId: string | null,
  token: string | null
): Promise<Advertisement | null> => {
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
    toast.error(
      error.response?.data?.message || "Error fetching advertisement"
    );
    return null;
  }
};

export const recordAdClickReq = async (
  adId: string,
  profileId: string | null,
  token: string | null
) => {
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
