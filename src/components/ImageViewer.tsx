import { MessageCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import CommentModal from "./CommentsModal";
import LikeButton from "./LikeButton";

interface ImageViewerProps {
  post: any;
  imageUrl?: string;
  onClose: () => void;
  selectedPost: any;
  setSelectedPost: (post: any) => void;
  userLikes: any;
  setUserLikes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  updatePostInFeed: (postId: string, newPost: any) => void;
}

export default function ImageViewer({
  post,
  onClose,
  setSelectedPost,
  userLikes,
  setUserLikes,
  updatePostInFeed,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [openComments, setOpenComments] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setInitialDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newScale = (currentDistance / initialDistance) * scale;
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center overflow-hidden touch-pan-x touch-pan-y"
    >
      <button
        className="absolute top-4 right-4 h-full w-full text-white hover:text-gray-300 transition-colors z-[60]"
        onClick={onClose}
      />
      <div
        className="relative w-full h-full flex items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={post.mediaUrl}
          alt="Fullscreen view"
          className="max-w-full max-h-[95vh] w-auto h-auto object-contain touch-pinch-zoom"
          style={{
            WebkitUserSelect: "none",
            userSelect: "none",
            transform: `scale(${scale})`,
            transition: "transform 0.1s",
          }}
        />
        <div className="absolute bottom-0 p-4 z-[70]">
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
      {openComments && (
        <div className="fixed inset-0 z-[80] bg-black bg-opacity-90 flex items-center justify-center overflow-auto">
          <button
            className="absolute top-4 right-4 h-full w-full text-white hover:text-gray-300 transition-colors z-[60]"
            onClick={() => setOpenComments(false)}
          />
          <CommentModal post={post} onClose={() => setOpenComments(false)} />
        </div>
      )}
    </div>
  );
}
