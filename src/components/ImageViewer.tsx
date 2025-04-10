import { ChevronLeft, MessageCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import LikeButton from "./LikeButton";
import VideoProgressBar from "./VideoProgressBar";

interface ImageViewerProps {
  post: {
    id: string;
    mediaUrl: string;
    mediaType?: "image" | "video";
    caption: string;
    likeCount: number;
    likedByLoggedInUser: boolean;
    commentCount: number;
  };
  onClose: () => void;
  selectedPost: any;
  setSelectedPost: (post: any) => void;
  userLikes: Record<string, boolean>;
  setUserLikes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  updatePostInFeed: (postId: string, newPost: any) => void;
  commentsCount?: Record<string, number>;
  setCommentsCount?: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  isFullscreen?: boolean;
}

export default function ImageViewer({
  post,
  onClose,
  setSelectedPost,
  setUserLikes,
  updatePostInFeed,
  commentsCount,
  setCommentsCount,
  isFullscreen,
}: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (post.mediaType === "video" && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.volume = 0;
      video.play().catch((error) => {
        console.warn("Autoplay prevented", error);
      });
    }
  }, [post.mediaType]);

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

  const handleClose = () => {
    if (setCommentsCount) {
      setCommentsCount({});
    }
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center overflow-hidden touch-pan-x touch-pan-y"
    >
      <button
        className="absolute top-4 right-4 h-full w-full text-white hover:text-gray-300 transition-colors z-[60]"
        onClick={handleClose}
      />
      <div
        className="relative w-full h-full flex items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {post.mediaType === "video" ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {videoLoading && (
              <div className="absolute inset-0 z-20 flex justify-center items-center bg-gray-100/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}
            <video
              ref={videoRef}
              src={post.mediaUrl}
              className={`w-full h-full object-contain ${
                isFullscreen ? "object-cover" : ""
              }`}
              controls={isFullscreen}
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={() => {
                setVideoLoading(false);
              }}
            />
            <div className="absolute bottom-0 w-full z-[70]">
              <VideoProgressBar videoElement={videoRef.current} />
            </div>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={post.mediaUrl}
            alt="Fullscreen view"
            className="max-w-full max-h-full w-auto h-auto object-contain touch-pinch-zoom"
            style={{
              WebkitUserSelect: "none",
              userSelect: "none",
              transform: `scale(${scale})`,
              transition: "transform 0.1s",
            }}
          />
        )}

        <div className="absolute bottom-0 left-0 p-4 z-[70] bg-black/60 rounded-tr-lg">
          <div className="flex items-center space-x-4 mb-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={post.likeCount}
              likedByLoggedInUser={post.likedByLoggedInUser}
              setUserLikes={setUserLikes}
              updatePostInFeed={updatePostInFeed}
            />
            <button
              onClick={() => setSelectedPost(post)}
              className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600"
            >
              <MessageCircle className="w-6 h-6" />
              <span>
                {commentsCount === undefined
                  ? post.commentCount
                  : commentsCount[post.id] || 0}
              </span>
            </button>
          </div>
          <p className="text-white">{post.caption}</p>
          <ChevronLeft
            className="w-6 h-6 z-[80] mt-2 text-white"
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
