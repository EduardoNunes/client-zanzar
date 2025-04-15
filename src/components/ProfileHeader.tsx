import React from "react";
import { Camera } from "lucide-react";
import FollowButton from "./handleFollowToggle";

interface Profile {
  profileId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
}

interface ProfileHeaderProps {
  profile: Profile | null;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followStats: {
    followers: number;
    following: number;
  };
  uploadingAvatar: boolean;
  handleAvatarChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  setIsFollowing: React.Dispatch<React.SetStateAction<boolean>>;
  setFollowStats: React.Dispatch<
    React.SetStateAction<{
      followers: number;
      following: number;
    }>
  >;
}

export default function ProfileHeader({
  profile,
  isCurrentUser,
  isFollowing,
  followStats,
  uploadingAvatar,
  handleAvatarChange,
  setIsFollowing,
  setFollowStats,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative group">
          <div className="flex justify-center items-center w-32 h-32 rounded-full overflow-hidden bg-gray-200 relative">
            {profile?.avatarUrl ? (
              <>
                <img
                  src={profile?.avatarUrl}
                  alt={profile?.username}
                  className="w-full h-full object-cover opacity-0"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const spinner = img.nextElementSibling as HTMLDivElement;
                    img.classList.remove("opacity-0");
                    spinner.classList.add("hidden");
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const spinner = img.nextElementSibling as HTMLDivElement;
                    img.classList.add("opacity-0");
                    spinner.classList.add("hidden");
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                </div>
              </>
            ) : (
              <Camera />
            )}
          </div>
          {isCurrentUser && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
              {uploadingAvatar ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
              ) : (
                <span className="text-white text-sm">Change</span>
              )}
            </label>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {profile?.username}
          </h1>
          <div className="flex justify-center md:justify-start space-x-6 text-gray-600">
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {profile?.totalPosts || 0}
              </span>
              Postagens
            </div>
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {followStats.followers}
              </span>
              Seguidores
            </div>
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {followStats.following}
              </span>
              Seguindo
            </div>
          </div>
          {!isCurrentUser && profile && (
            <div className="mt-4">
              <FollowButton
                profile={profile}
                isFollowing={isFollowing}
                setIsFollowing={setIsFollowing}
                setFollowStats={setFollowStats}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
