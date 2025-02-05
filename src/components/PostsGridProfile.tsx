import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState } from "react";
import CommentModal from "./CommentsModal";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import ImageViewer from "./ImageViewer";
import { handleLikeReq } from "../requests/feedRequests";

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

interface PostsGridProfileProps {
  userLikes: { [key: string]: boolean };
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setUserLikes: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  posts: Post[];
}

export default function PostsGridProfile({
  userLikes,
  setPosts,
  setUserLikes,
  posts,
}: PostsGridProfileProps) {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement>,
    postId: string
  ) => {
    e.preventDefault();
    const profileId = Cookies.get("profile_id");
    if (!profileId) {
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
    await handleLikeReq(postId, profileId);
  };
  
  return (
    <div>
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

      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  );
}
