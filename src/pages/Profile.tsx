import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostsGridProfile from "../components/PostsGridProfile";
import ProfileHeader from "../components/ProfileHeader";
import {
  getProfileReq,
  updateProfileImageReq,
} from "../requests/profileRequests";

interface Profile {
  profileId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const profileId = Cookies.get("profile_id");
    if (!profileId) {
      navigate("/login");
    }
    fetchProfileAndPosts();
  }, [username]);

  async function fetchProfileAndPosts() {
    try {
      const profileId = Cookies.get("profile_id");

      const profileData = username && (await getProfileReq(username));
      profileData && setProfile(profileData);

      setIsFollowing(profileData.isFollowed);

      const isCurrentUserProfile = profileId === profileData.profileId;
      setIsCurrentUser(isCurrentUserProfile);

      setFollowStats({
        followers: profileData.followersCount || 0,
        following: profileData.followingCount || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const profileId = Cookies.get("profile_id");
    if (!profileId) {
      navigate("/login");
    }
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploadingAvatar(true);
      if (profileId) {
        await updateProfileImageReq(profileId, file);
        await fetchProfileAndPosts();
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <ProfileHeader
          profile={profile}
          isCurrentUser={isCurrentUser}
          isFollowing={isFollowing}
          followStats={followStats}
          uploadingAvatar={uploadingAvatar}
          handleAvatarChange={handleAvatarChange}
          setIsFollowing={setIsFollowing}
          setFollowStats={setFollowStats}
        />
        <PostsGridProfile username={username} />
      </div>
    </>
  );
}
