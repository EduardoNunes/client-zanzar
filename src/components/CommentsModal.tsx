import { useEffect, useState, useRef } from "react";
import { get15commentsReq, newCommentReq } from "../requests/feedRequests";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface Post {
  post: string;
  id: string;
  commentCount: number;
  comments: {
    id: string;
    profile: {
      username: string;
    };
    content: string;
  }[];
}

interface CommentModalProps {
  post: Post;
  onClose: () => void;
}

export default function CommentModal({ post, onClose }: CommentModalProps) {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const commentContainerRef = useRef<HTMLDivElement>(null);

  const loadedCommentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchComments();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (commentContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          commentContainerRef.current;

        if (scrollHeight - (scrollTop + clientHeight) < 50 && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    const container = commentContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading]);

  const fetchComments = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const newComments = await get15commentsReq(post.id, page);

      if (Array.isArray(newComments)) {
        const uniqueComments = newComments.filter(
          (comment) => !loadedCommentIds.current.has(comment.id)
        );

        if (uniqueComments.length > 0) {
          uniqueComments.forEach((comment) =>
            loadedCommentIds.current.add(comment.id)
          );

          setComments((prevComments) => [...prevComments, ...uniqueComments]);
        }
      } else {
        console.error("Comentários carregados não são um array:", newComments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const userId = Cookies.get("user_id");
      const userName = Cookies.get("user_name");

      if (!userId) navigate("/login");

      userId && newCommentReq(post.id, userId, newComment);

      const newCommentData = {
        id: String(new Date().getTime()),
        content: newComment,
        profile: {
          username: userName || "Phantom",
          avatarUrl: "https://via.placeholder.com/40",
        },
      };

      setComments((prevComments) => [newCommentData, ...prevComments]);
      post.commentCount += 1;

      loadedCommentIds.current.add(newCommentData.id);

      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-end bg-opacity-50 z-50">
      <div className="bg-white rounded-t-lg w-full max-w-lg flex flex-col h-[500px]">
        <div className="p-6">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-indigo-600"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6" ref={commentContainerRef}>
          <div className="space-y-4">
            {comments && Array.isArray(comments) && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex flex-col items-start text-sm">
                  <button className="font-semibold text-indigo-600 mr-1">
                    {comment.profile.username}:
                  </button>
                  <span>{comment.content}</span>
                </div>
              ))
            ) : (
              <div>No comments yet</div>
            )}
            {loading && <div>Loading more comments...</div>}
          </div>
        </div>
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              onClick={handleComment}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
