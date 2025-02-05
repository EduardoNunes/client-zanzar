import Cookies from "js-cookie";
import { Camera, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostsGridProfile from "../components/PostsGridProfile";
import FollowButton from "../components/handleFollowToggle";
import {
  getPostsReq,
  getProfileReq,
  updateProfileImageReq,
} from "../requests/profileRequests";

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
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  let scrollTriggered = false;

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

      const initialPosts = username && (await getPostsReq(username, 1, 2));
      if (initialPosts) {
        setPosts(initialPosts || []);
        const likesMap = initialPosts.reduce(
          (acc: Record<string, boolean>, post: Post) => {
            acc[post.id] = post.likedByLoggedInUser || false;
            return acc;
          },
          {}
        );
        setUserLikes(likesMap);
      }

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

  const loadMorePosts = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const newPosts = username && (await getPostsReq(username, page + 1, 2));
      if (newPosts && newPosts.length > 0) {
        const newLikesMap = newPosts.reduce(
          (acc: Record<string, boolean>, post: Post) => {
            acc[post.id] = post.likedByLoggedInUser || false;
            return acc;
          },
          {}
        );

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setUserLikes((prevLikes) => ({ ...prevLikes, ...newLikesMap }));
        setPage((prevPage) => prevPage + 1);
      } else {
        setLoadingMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      //esse if foi adicionado para evitar carregamento automático da segunda req de postagens, pois ao carregar a página vindo de uma página com o scroll rolado p baixo a página automaticamente carrega com o scroll em baixo resultando na chamada indesejada da função loadMorePosts
      if (!scrollTriggered) {
        scrollTriggered = true;
        return;
      }

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 10
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore]);

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

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {profile?.avatarUrl ? (
                  <img
                    src={profile?.avatarUrl}
                    alt={profile?.username}
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
                  {profile?.username}
                </h1>
                {!isCurrentUser && (
                  <FollowButton
                    profile={profile}
                    isFollowing={isFollowing}
                    setIsFollowing={setIsFollowing}
                    setFollowStats={setFollowStats}
                  />
                )}
              </div>
              <div className="mt-4 flex gap-6 text-gray-600">
                <div>
                  <span className="font-bold text-gray-900">
                    {posts.length}
                  </span>
                  posts
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {followStats.following}
                  </span>
                  seguindo
                </div>
                <div>
                  <span className="font-bold text-gray-900">
                    {followStats.followers}
                  </span>
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
        {loadingMore && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {!loadingMore && posts.length > 0 && (
          <div className="text-center text-gray-500 py-4">
            No more posts to load.
          </div>
        )}
      </div>
    </>
  );
}
