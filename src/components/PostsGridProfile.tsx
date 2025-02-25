import Cookies from "js-cookie";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLikeReq } from "../requests/feedRequests";
import { getPostsReq } from "../requests/profileRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";

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
  username: string | undefined;
}

export default function PostsGridProfile({
  username,
}: PostsGridProfileProps) {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  let scrollTriggered = false;

  useEffect(() => {
    fetchPosts();
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      //if foi adicionado evitando segunda req de postagens, pois ao carregar a página vindo de uma página com o scroll rolado p baixo a página automaticamente carrega com o scroll em baixo resultando na chamada indesejada da função loadMorePosts
      if (!scrollTriggered) {
        scrollTriggered = true;
        return;
      }

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 10
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore]);

  const fetchPosts = async () => {
    try {
      const initialPosts = username && (await getPostsReq(username, 1, 2));

      console.log("POSTS", initialPosts)

      if (initialPosts) {
        setPosts(initialPosts || []);
        const likesMap = initialPosts.reduce(
          (acc: Record<string, boolean>, post: Post) => {
            acc[post.id] = post.likedByLoggedInUser || false;
            return acc;
          },
          {}
        );
        setUserLikes(likesMap);
      }

    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }

  const loadMorePosts = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      const newPosts = username && (await getPostsReq(username, page + 1, 2));
      if (newPosts && newPosts.length > 0) {
        const newLikesMap = newPosts.reduce(
          (acc: Record<string, boolean>, post: Post) => {
            acc[post.id] = post.likedByLoggedInUser || false;
            return acc;
          },
          {}
        );

        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
        setUserLikes((prevLikes) => ({ ...prevLikes, ...newLikesMap }));
        setPage((prevPage) => prevPage + 1);
      } else {
        setLoadingMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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
            className="rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in relative"
          >
            <div className="relative w-full aspect-square">
              <img
                src={post.mediaUrl}
                alt={post.caption}
                className="w-full h-full object-cover opacity-0"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const spinner = img.nextElementSibling as HTMLDivElement;
                  img.classList.remove('opacity-0');
                  spinner.classList.add('hidden');
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  const spinner = img.nextElementSibling as HTMLDivElement;
                  img.classList.add('opacity-0');
                  spinner.classList.add('hidden');
                }}
                onClick={() => setFullscreenImage(post.mediaUrl)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
              </div>
            </div>
            <div className="p-4 h-[96px]">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={(e) => handleLike(e, post.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <Heart
                    className={`w-6 h-6 ${userLikes[post.id] ? "fill-red-600 text-red-600" : ""
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
          className={`md:hidden transition-all duration-100 ease-in-out ${selectedPost
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

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loadingMore && posts.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          No more posts to load.
        </div>
      )}
    </div>
  );
}
