import React, { useState } from "react";
import { UserMinus, UserPlus, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { followProfileReq } from "../requests/profileRequests";
import { toast } from "react-toastify";

interface FollowButtonProps {
  profile: any;
  isFollowing: boolean;
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>;
  setFollowStats: any;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  profile,
  isFollowing,
  setIsFollowing,
  setFollowStats,
}) => {
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const token = Cookies.get("access_token");
      const profileId = Cookies.get("profile_id");
      if (!token) {
        navigate("/");
        return;
      }
      if (!profileId) {
        toast.error("Algo deu errado, contate algum adm");
        return;
      }

      await followProfileReq(profileId, profile.profileId);
      setFollowStats((prev: { followers: number }) => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
      }));
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={followLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
    >
      {followLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-5 h-5" />
          Deixar de Seguir
        </>
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          Seguir
        </>
      )}
    </button>
  );
};

export default FollowButton;
