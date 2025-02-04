import { formatDistanceToNow } from "date-fns";
import userImageDefault from "../assets/user.svg";
import Cookies from "js-cookie";
import { Heart, LogIn, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLikeReq } from "../requests/feedRequests";
import { getSinglePostReq } from "../requests/SinglePostRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";

interface SinglePostModalProps {
  postId: string;
  onClose: () => void;
}

export default function SinglePostModal({
  postId,
  onClose,
}: SinglePostModalProps) {
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const token = Cookies.get("access_token");

  useEffect(() => {
    fetchPost();
  }, []);

  async function fetchPost() {
    const profileId = Cookies.get("profile_id");
    if (!profileId) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const data = await getSinglePostReq(postId, profileId);
      setPost(data);
      setIsLiked(data.likedByLoggedInUser || false);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const profileId = Cookies.get("profile_id");
    if (!profileId) {
      navigate("/login");
      return;
    }

    setIsLiked((prev) => !prev);
    setPost((prevPost: any) => ({
      ...prevPost,
      likeCount: isLiked ? prevPost.likeCount - 1 : prevPost.likeCount + 1,
    }));

    await handleLikeReq(post.id, profileId);
  };

  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Postagem não encontrada
        </h2>
        {!token && (
          <div className="mt-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to create post</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <img
              src={post.profile.avatarUrl || userImageDefault}
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
              onClick={(e) => handleLike(e)}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked ? "fill-red-600 text-red-600" : ""
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
          </div>

          <p className="text-gray-900">{post.caption}</p>
        </div>
      </div>

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

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  );
}
