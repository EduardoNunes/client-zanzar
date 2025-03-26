import { Loader2, UserMinus, UserPlus } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import { followProfileReq } from "../requests/profileRequests";

interface FollowButtonProps {
  profile: any;
  isFollowing: boolean;
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>;
  setFollowStats: React.Dispatch<
    React.SetStateAction<{ followers: number; following: number }>
  >;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  profile,
  isFollowing,
  setIsFollowing,
  setFollowStats,
}) => {
  const { token, profileId } = useGlobalContext();
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    if (!profile || !profileId || !token) {
      console.error("Profile, profileId or token not found");
      navigate("/login");
      return;
    }

    setFollowLoading(true);

    try {
      await followProfileReq(profileId, profile.profileId, token);
      setIsFollowing(!isFollowing);
      setFollowStats((prev: { followers: number; following: number }) => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
      }));
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
      className={`flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
