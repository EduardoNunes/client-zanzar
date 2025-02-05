import Cookies from "js-cookie";
import { Camera, Loader2, UserMinus, UserPlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  followProfileReq,
  getPostsReq,
  getProfileReq,
  updateProfileImageReq,
} from "../requests/profileRequests";
import PostsGridProfile from "../components/PostsGridProfile";

interface Profile {
  profileId: string;
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface Post {
  likedByLoggedInUser: boolean;
  likeCount: number;
  commentCount: number;
  id: string;
  mediaUrl: string;
  caption: string;
  created_at: string;
  post: string;
  comments: { id: string; profile: { username: string }; content: string }[];
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers: 0,
    following: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  useEffect(() => {
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

      const posts = username && (await getPostsReq(username));
      posts && setPosts(posts || []);

      const likesMap = posts.reduce(
        (acc: Record<string, boolean>, post: Post) => {
          acc[post.id] = post.likedByLoggedInUser || false;
          return acc;
        },
        {}
      );

      setUserLikes(likesMap);

      // Fetch follow stats

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
      if (isFollowing) {
        profileId && (await followProfileReq(profileId, profile.profileId));

        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers - 1,
        }));
      } else {
        profileId && (await followProfileReq(profileId, profile.profileId));

        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers + 1,
        }));
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

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

      profileId &&
        (await updateProfileImageReq(profileId, file)).then(
          fetchProfileAndPosts()
        );
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">
          Usuário não encontrado
        </h2>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera />
                )}
              </div>
              {isCurrentUser && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                  {uploadingAvatar ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </label>
              )}
            </div>
            <div className="text-center md:text-left flex-grow">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.username}
                </h1>
                {!isCurrentUser && (
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
                )}
              </div>
              <div className="mt-4 flex gap-6 text-gray-600">
                <div>
                  <span className="font-bold text-gray-900">
                    {posts.length}
                  </span>{" "}
                  posts
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {followStats.following}
                  </span>{" "}
                  seguindo
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {followStats.followers}
                  </span>{" "}
                  seguidores
                </div>
              </div>
            </div>
          </div>
        </div>
        <PostsGridProfile
          userLikes={userLikes}
          setPosts={setPosts}
          setUserLikes={setUserLikes}
          posts={posts}
        />
      </div>
    </>
  );
}
