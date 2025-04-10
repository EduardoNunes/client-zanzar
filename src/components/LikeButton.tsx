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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setIsLiked(likedByLoggedInUser);
  }, [likedByLoggedInUser]);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!profileId) {
      navigate("/login");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      // Atualização otimista
      const newLikeState = !isLiked;
      const newCount = newLikeState ? likeCount + 1 : likeCount - 1;

      setIsLiked(newLikeState);
      setLikeCount(newCount);
      setUserLikes((prev) => ({ ...prev, [postId]: newLikeState }));
      updatePostInFeed(postId, {
        likesCount: newCount,
        likedByLoggedInUser: newLikeState,
      });

      // Requisição real
      const response = await handleLikeReq(postId, profileId, token);

      if (response) {
        // Atualiza com a resposta real do servidor
        setIsLiked(newLikeState);
        setLikeCount(response.likesCount);
        setUserLikes((prev) => ({ ...prev, [postId]: newLikeState }));
        updatePostInFeed(postId, {
          likesCount: response.likesCount,
          likedByLoggedInUser: newLikeState,
        });
      }
    } catch (error) {
      console.error("Erro ao processar like:", error);
      // Reverte em caso de erro
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      setUserLikes((prev) => ({ ...prev, [postId]: !isLiked }));
      updatePostInFeed(postId, {
        likesCount: likeCount,
        likedByLoggedInUser: !isLiked,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1 transition-colors duration-200 ${
        isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"
      }`}
    >
      <Heart
        className={`w-6 h-6 transition-transform duration-200 hover:scale-110 ${
          isLiked ? "fill-red-600" : ""
        }`}
      />
      <span>{likeCount}</span>
    </button>
  );
}
