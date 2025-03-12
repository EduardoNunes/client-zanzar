import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import Cookies from "js-cookie";
import { handleLikeReq } from "../requests/feedRequests";
import { useNavigate } from "react-router-dom";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  userLikes: Record<string, boolean>;
  setUserLikes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  updatePostInFeed: (postId: string, newPost: any) => void;
}

export default function LikeButton({
  postId,
  initialLikeCount,
  userLikes,
  setUserLikes,
  updatePostInFeed,
}: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(userLikes[postId] || false);
  const navigate = useNavigate();

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setIsLiked(userLikes[postId]);
  }, [userLikes[postId]]);

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
    
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prevLikeCount) =>
      newIsLiked ? prevLikeCount + 1 : prevLikeCount - 1
    );

    setUserLikes((prev) => ({ ...prev, [postId]: newIsLiked }));

    // Call the API to handle the like/unlike action
    const response = await handleLikeReq(postId, profileId);

    if (response) {
      const newPost = await response;
      updatePostInFeed(postId, newPost);
    }
  };

  return (
    <button
      onClick={(e) => handleLike(e, postId)}
      className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
    >
      <Heart
        className={`w-6 h-6 ${isLiked ? "fill-red-600 text-red-600" : ""}`}
      />
      <span>{likeCount}</span>
    </button>
  );
}
