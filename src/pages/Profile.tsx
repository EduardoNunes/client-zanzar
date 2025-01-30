import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Loader2, UserPlus, UserMinus, Cookie } from "lucide-react";
import ImageViewer from "../components/ImageViewer";
import { getProfileReq, getPostsReq } from "../requests/profileRequests";
import Cookies from "js-cookie";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  mediaUrl: string;
  caption: string;
  created_at: string;
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function Profile() {
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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [username]);

  async function fetchProfileAndPosts() {
    try {
      const userId = Cookies.get("user_id");

      const profileData = userId && (await getProfileReq(userId));
      profileData && setProfile(profileData);

      const isCurrentUserProfile = userId === profileData.profileId;
      setIsCurrentUser(isCurrentUserProfile);

      // Fetch user's posts
      const posts = userId && await getPostsReq(userId);
      posts && setPosts(posts || []);
console.log("POSTS", posts)
      // Fetch follow stats
      const { data: followersCount } = await supabase
        .from("followers")
        .select("id", { count: "exact" })
        .eq("following_id", profileData.id);

      const { data: followingCount } = await supabase
        .from("followers")
        .select("id", { count: "exact" })
        .eq("follower_id", profileData.id);

      setFollowStats({
        followers: followersCount?.length || 0,
        following: followingCount?.length || 0,
      });

      // Check if current user is following this profile
      if (user && !isCurrentUserProfile) {
        const { data: followData } = await supabase
          .from("followers")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", profileData.id);

        setIsFollowing(followData && followData.length > 0);
      }
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (isFollowing) {
        // Unfollow
        await supabase
          .from("followers")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profile.id);

        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers - 1,
        }));
      } else {
        // Follow
        await supabase.from("followers").insert({
          follower_id: user.id,
          following_id: profile.id,
        });

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
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);

      // Upload avatar image
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${profile?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("posts").getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile?.id);

      if (updateError) throw updateError;

      // Refresh profile data
      fetchProfileAndPosts();
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
                <img
                  src={profile.avatar_url || "https://via.placeholder.com/128"}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
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
                    {followStats.followers}
                  </span>{" "}
                  seguidores
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {followStats.following}
                  </span>{" "}
                  seguindo
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in"
              onClick={() => setFullscreenImage(post.mediaUrl)}
            >
              <img
                src={post.mediaUrl}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma postagem ainda
          </div>
        )}
      </div>

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </>
  );
}
