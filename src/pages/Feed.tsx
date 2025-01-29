import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import { Heart, LogIn, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import ImageViewer from "../components/ImageViewer";
import {
  handleLikeReq,
  getFeedReq,
  handleCommentReq,
} from "../requests/feedRequests";

interface Post {
  commentCount: number;
  likeCount: number;
  likedByLoggedInUser: boolean;
  createdAt: string | number | Date;
  id: string;
  mediaUrl: string;
  caption: string;
  created_at: string;
  profile: {
    avatarUrl: string;
    username: string;
    avatar_url: string;
  };
  likes: {
    id: string;
  }[];
  comments: {
    profile: any;
    id: string;
    content: string;
    profiles: {
      username: string;
    };
  }[];
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const token = Cookies.get("access_token");

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const userId = Cookies.get("user_id");
    if (!userId) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const data = await getFeedReq(userId);
      setPosts(data || []);

      const likesMap = data.reduce(
        (acc: Record<string, boolean>, post: Post) => {
          acc[post.id] = post.likedByLoggedInUser || false;
          return acc;
        },
        {}
      );

      setUserLikes(likesMap);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(
    e: React.MouseEvent<HTMLButtonElement>,
    postId: string
  ) {
    e.preventDefault();

    try {
      const userId = Cookies.get("user_id");

      if (!userId) {
        redirect("/login");
        return;
      }

      const isLiked = userLikes[postId];
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
            };
          }
          return post;
        })
      );

      setUserLikes((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }));

      await handleLikeReq(postId, userId);
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }

  async function handleComment(postId: string) {
    if (!newComment.trim()) return;

    try {
      const userId = Cookies.get("user_id");
      const userName = Cookies.get("user_name");

      if (!userId) {
        redirect("/login");
        return;
      }

      const newCommentData = await handleCommentReq(postId, userId, newComment);

      const userProfile = {
        username: userName || "Phantom",
        avatarUrl: "https://via.placeholder.com/40", // Ajuste para o avatar correto
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  { ...newCommentData, profile: userProfile },
                ],
                commentCount: post.commentCount + 1, // Atualiza contagem de comentários
              }
            : post
        )
      );

      setNewComment("");
      setCommentingOn(null);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  }

  const navigateToProfile = (username: string) => {
    navigate("/login");
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No posts yet</h2>
        {!token && (
          <div className="mt-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to create posts</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    post.profile.avatarUrl || "https://via.placeholder.com/40"
                  }
                  alt={post.profile.username}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => navigateToProfile(post.profile.username)}
                />
                <div>
                  <button
                    onClick={() => navigateToProfile(post.profile.username)}
                    className="font-semibold hover:text-indigo-600 transition-colors"
                  >
                    {post.profile.username}
                  </button>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="cursor-zoom-in">
              <img
                src={post.mediaUrl}
                alt="Post content"
                className="w-full max-h-[600px] object-cover"
                onClick={() => setFullscreenImage(post.mediaUrl)}
              />
            </div>
            <div className="p-4">
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
                  onClick={() =>
                    token ? setCommentingOn(post.id) : navigate("/login")
                  }
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>{post.commentCount}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              {post.caption && (
                <p className="mb-4">
                  <button
                    onClick={() => navigateToProfile(post.profile.username)}
                    className="font-semibold hover:text-indigo-600 transition-colors"
                  >
                    {post.profile.username}
                  </button>
                  {post.caption}
                </p>
              )}
              <div className="space-y-2">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="text-sm">
                    <button
                      onClick={() =>
                        comment.profile
                          ? navigateToProfile(comment.profile.username)
                          : null
                      }
                      className="font-semibold hover:text-indigo-600 transition-colors mr-1"
                    >
                      {comment.profile.username}{":"}
                    </button>
                    {comment.content}
                  </div>
                ))}
              </div>
              {commentingOn === post.id && (
                <div className="mt-4 flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
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
