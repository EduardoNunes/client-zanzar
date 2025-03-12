import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import { CircleUserRound, LogIn, MessageCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSinglePostReq } from "../requests/SinglePostRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";
import LikeButton from "./LikeButton";

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
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
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
      setUserLikes({ [postId]: data.likedByLoggedInUser || false });
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }

  const updatePostInFeed = (postId: string, newPost: any) => {
    setPost((prevPost: { id: string }) =>
      prevPost.id === postId
        ? { ...prevPost, likeCount: newPost.likesCount }
        : prevPost
    );
  };

  const updateCommentCountInPost = (
    postId: string,
    newCommentCount: number
  ) => {
    setPost((prevPost: { id: string }) =>
      prevPost.id === postId
        ? { ...prevPost, commentCount: newCommentCount }
        : prevPost
    );
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
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          X
        </button>

        {/* Header (Profile Info) */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            {post.profile.avatarUrl ? (
              <img
                src={post.profile.avatarUrl}
                alt={post.profile.username}
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => navigateToProfile(post.profile.username)}
              />
            ) : (
              <CircleUserRound />
            )}
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

        {/* Image */}
        <div className="cursor-zoom-in relative">
          <img
            src={post.mediaUrl}
            alt="Post content"
            className="w-full max-h-[600px] min-h-[200px] object-cover"
            onClick={() => setFullscreenImage(post.mediaUrl)}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
          )}
        </div>

        {/* Actions and Caption */}
        <div className="p-4">
          <div className="flex items-center space-x-4 mb-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.likeCount}
              userLikes={userLikes}
              setUserLikes={setUserLikes}
              updatePostInFeed={updatePostInFeed}
            />
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

      {/* Comment Modal Render (Conditional) */}
      {selectedPost && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end"
          onClick={onClose} // Close modal if clicked outside
        >
          <div
            className="bg-white w-full rounded-t-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicked inside
          >
            <CommentModal
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
              updateCommentCountInPost={updateCommentCountInPost}
            />
          </div>
        </div>
      )}

      {/* Image Viewer (Conditional) */}
      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          post={post}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          userLikes={userLikes}
          setUserLikes={setUserLikes}
          updatePostInFeed={updatePostInFeed}
        />
      )}
    </div>
  );
}
