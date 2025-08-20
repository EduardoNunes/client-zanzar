import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostsGridProfile from "../components/PostsGridProfile";
import ProfileHeader from "../components/ProfileHeader";
import {
  getProfileReq,
  updateProfileImageReq,
  updateUsernameReq,
} from "../requests/profileRequests";
import { useGlobalContext } from "../context/globalContext";
import LoadSpinner from "../components/LoadSpinner";
import { toast } from "react-toastify";
import { Preferences } from "@capacitor/preferences";

interface Profile {
  profileId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  hasUserStore: boolean;
  isOwnProfile: boolean;
  storeSlug: string | null;
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function Profile() {
  const { token, profileId, isLoadingToken } = useGlobalContext();
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
    if (!isLoadingToken && !profileId && !token) {
      navigate("/login");
    } else {
      fetchProfileAndPosts();
    }
  }, [isLoadingToken, profileId, navigate]);

  async function fetchProfileAndPosts() {
    try {
      setLoading(true);
      const profileData = username && (await getProfileReq(username, token));
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
    if (!profileId || !token) {
      navigate("/login");
      return;
    }

    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploadingAvatar(true);

      await updateProfileImageReq(profileId, file, token);
      await fetchProfileAndPosts();
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return <LoadSpinner />;
  }

  const handleEditUserName = async (newUsername: string) => {
    if (!profileId || !token) {
      navigate("/login");
      return;
    }

    if (newUsername.length < 3 || newUsername.length > 20) {
      toast.info("O username deve ter entre 3 e 20 caracteres.");
      return;
    }

    try {
      await updateUsernameReq(profileId, newUsername, token);
      await Preferences.set({ key: "user_name", value: newUsername });
      toast.success("Username atualizado com sucesso!");
      setProfile((prevProfile) => {
        if (prevProfile) {
          return { ...prevProfile, username: newUsername };
        }
        return prevProfile;
      });
      navigate(`/profile/${newUsername}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
        console.error(error);
      } else {
        toast.error("Ocorreu um erro desconhecido.");
        console.error(error);
      }
    }
  };

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
          handleEditUserName={handleEditUserName}
        />
        <PostsGridProfile username={username} />
      </div>
    </>
  );
}
