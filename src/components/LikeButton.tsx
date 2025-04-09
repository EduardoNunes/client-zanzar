import { Heart } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import { handleLikeReq } from "../requests/feedRequests";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  likedByLoggedInUser: boolean;
  setUserLikes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  updatePostInFeed: (postId: string, newPost: any) => void;
}

export default function LikeButton({
  postId,
  initialLikeCount,
  likedByLoggedInUser,
  setUserLikes,
  updatePostInFeed,
}: LikeButtonProps) {
  const { token, profileId } = useGlobalContext();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(likedByLoggedInUser);
  const navigate = useNavigate();

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setIsLiked(likedByLoggedInUser);
  }, [likedByLoggedInUser]);

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement>,
    postId: string
  ) => {
    e.preventDefault();

    if (!profileId) {
      navigate("/login");
      return;
    }

    try {
      const response = await handleLikeReq(postId, profileId, token);
      if (response) {
        const newLikeState = !isLiked;
        setIsLiked(newLikeState);
        setLikeCount(response.likesCount);
        setUserLikes((prev) => ({ ...prev, [postId]: newLikeState }));

        // Atualiza o estado no Feed e ImageViewer
        updatePostInFeed(postId, {
          likesCount: response.likesCount,
          likedByLoggedInUser: newLikeState,
        });
      }
    } catch (error) {
      console.error("Erro ao processar like:", error);
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
