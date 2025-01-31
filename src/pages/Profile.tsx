import Cookies from "js-cookie";
import {
  Camera,
  Heart,
  Loader2,
  MessageCircle,
  Share2,
  UserMinus,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cam from "../assets/cam.svg";
import CommentModal from "../components/CommentsModal";
import ImageViewer from "../components/ImageViewer";
import { handleLikeReq } from "../requests/feedRequests";
import {
  getPostsReq,
  getProfileReq,
  updateProfileImage,
  followProfileReq,
} from "../requests/profileRequests";
import { toast } from "react-toastify";

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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileAndPosts();
  }, [username]);

  async function fetchProfileAndPosts() {
    try {
      const userId = Cookies.get("user_id");

      const profileData = username && (await getProfileReq(username));
      profileData && setProfile(profileData);

      setIsFollowing(profileData.isFollowed);

      const isCurrentUserProfile = userId === profileData.profileId;
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
      const userId = Cookies.get("user_id");

      if (!token) {
        navigate("/");
        return;
      }

      if (!userId) {
        toast.error("Algo deu errado, contate algum adm");
        return;
      }
      if (isFollowing) {
        userId && (await followProfileReq(userId, profile.profileId));

        setFollowStats((prev) => ({
          ...prev,
          followers: prev.followers - 1,
        }));
      } else {
        userId && (await followProfileReq(userId, profile.profileId));

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
    const userId = Cookies.get("user_id");

    if (!userId) {
      navigate("/login");
    }

    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);

      userId &&
        (await updateProfileImage(userId, file)).then(fetchProfileAndPosts());
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement>,
    postId: string
  ) => {
    e.preventDefault();
    const userId = Cookies.get("user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    const isLiked = userLikes[postId];
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );

    setUserLikes((prev) => ({ ...prev, [postId]: !isLiked }));
    await handleLikeReq(postId, userId);
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
                  src={profile.avatarUrl || Cam}
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
              className="rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in"
            >
              <img
                src={post.mediaUrl}
                alt={post.caption}
                className="w-full h-[100%-96px] object-cover"
                onClick={() => setFullscreenImage(post.mediaUrl)}
              />
              <div className="p-4 h-[96px]">
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        userLikes[post.id] ? "fill-red-600 text-red-600" : ""
                      }`}
                    />
                    <span>{post.likeCount}</span>
                  </button>
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span>{post.commentCount}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-900">{post.caption}</p>
              </div>
            </div>
          ))}
          <div
            className={`md:hidden transition-all duration-100 ease-in-out ${
              selectedPost
                ? "max-h-screen opacity-100 visible"
                : "max-h-0 opacity-0 invisible"
            }`}
          >
            {selectedPost && (
              <CommentModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
              />
            )}
          </div>
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
