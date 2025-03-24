import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Cookies from "js-cookie";
import { CircleUserRound, LogIn, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CommentModal from "../components/CommentsModal";
import ImageViewer from "../components/ImageViewer";
import LikeButton from "../components/LikeButton";
import VideoProgressBar from "../components/VideoProgressBar";
import { getFeedReq } from "../requests/feedRequests";

interface Post {
  commentCount: number;
  likeCount: number;
  likedByLoggedInUser: boolean;
  createdAt: string | number | Date;
  id: string;
  mediaUrl: string;
  mediaType?: "image" | "video";
  caption: string;
  created_at: string;
  post: string;
  comments: { id: string; profile: { username: string }; content: string }[];
  profile: {
    avatarUrl: string;
    username: string;
  };
  likes: {
    id: string;
  }[];
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [fullscreenImage, setFullscreenImage] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const token = Cookies.get("access_token");
  const [videoRefsState, setVideoRefsState] = useState<{
    [key: number]: HTMLVideoElement | null;
  }>({});
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [commentsCount, setCommentsCount] = useState<number>(0);

  // Refs para os elementos de vídeo
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Limpar o observer
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // Configurar o observer
  useEffect(() => {
    // Criar o observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting) {
            // video não está visível
            videoElement.pause();
            videoElement.muted = true;
            videoElement.currentTime = 0;
          } else {
            // Video visível
            videoElement.play().catch(() => {
              console.warn("Autoplay prevented");
            });
          }
        });
      },
      {
        threshold: 0.3, // exibir quando 30% do vídeo estiver visível
      }
    );

    // Observe videos
    videoRefs.current.forEach((videoEl) => {
      if (videoEl) {
        observerRef.current?.observe(videoEl);
      }
    });

    return cleanupObserver;
  }, [posts, cleanupObserver]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const profileId = Cookies.get("profile_id");

    if (!profileId) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const data = await getFeedReq(profileId, 1, 3);

      // Determine tipo de media para cada post
      const processedPosts = data.map((post: Post) => {
        // você pode usar a função includes para verificar se a string contém outra string
        const isVideo =
          post.mediaUrl.includes("/videos/") ||
          post.mediaUrl.includes(".mp4") ||
          post.mediaUrl.includes("video");

        return {
          ...post,
          mediaType: isVideo ? "video" : "image",
        };
      });

      const initialVideoLoadingState = processedPosts.reduce(
        (acc: { [key: number]: boolean }, _: any, index: number) => {
          acc[index] = true; // inicialmente carregando para todos os vídeos
          return acc;
        },
        {}
      );

      setVideoLoading(initialVideoLoadingState);

      setPosts(processedPosts || []);
      const likesMap = processedPosts.reduce(
        (acc: Record<string, boolean>, post: Post) => {
          acc[post.id] = post.likedByLoggedInUser || false;
          return acc;
        },
        {}
      );

      setUserLikes(likesMap);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const loadMorePosts = async () => {
    if (!hasMorePosts || loading) return;

    try {
      const profileId = Cookies.get("profile_id");
      if (!profileId) {
        navigate("/login");
        return;
      }

      setLoading(true);
      const newPosts = await getFeedReq(profileId, page + 1, 3);

      // Determina o tipo de media para cada post
      const processedPosts = newPosts.map((post: Post) => {
        const isVideo =
          post.mediaUrl.includes("/videos/") ||
          post.mediaUrl.includes(".mp4") ||
          post.mediaUrl.includes("video");

        return {
          ...post,
          mediaType: isVideo ? "video" : "image",
        };
      });

      const newVideoLoadingState = processedPosts.reduce(
        (acc: { [key: number]: boolean }, _: any, index: number) => {
          acc[index + posts.length] = true; // inicialmente carregando para todos os vídeos
          return acc;
        },
        {}
      );

      setVideoLoading((prev) => ({ ...prev, ...newVideoLoadingState }));

      const newLikesMap = processedPosts.reduce(
        (acc: Record<string, boolean>, post: Post) => {
          acc[post.id] = post.likedByLoggedInUser || false;
          return acc;
        },
        {}
      );

      if (processedPosts.length > 0) {
        setUserLikes((prevLikes) => ({
          ...prevLikes,
          ...newLikesMap,
        }));

        setPosts((prevPosts) => [...prevPosts, ...processedPosts]);
        setPage((prevPage) => prevPage + 1);
      } else {
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 10
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMorePosts, loading]);

  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const updatePostInFeed = (postId: string, newPost: any) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likeCount: newPost.likesCount } : post
      )
    );
  };

  const updateCommentCountInPost = (
    postId: string,
    newCommentCount: number
  ) => {
    setCommentsCount(newCommentCount);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCommentCount } : post
      )
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No posts yet</h2>
        {!token && (
          <div className="mt-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Login to create posts</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {posts.map((post, index) => (
          <div key={post.id} className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                {post.profile.avatarUrl ? (
                  <img
                    src={post.profile.avatarUrl}
                    alt={post.profile.username}
                    className="w-10 h-10 object-cover rounded-full cursor-pointer"
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
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full aspect-square bg-gray-100">
              {post.mediaUrl ? (
                <div className="relative w-full h-full">
                  {post.mediaType === "video" ? (
                    <div className="relative w-full h-full">
                      {videoLoading[index] && (
                        <div className="absolute inset-0 z-20 flex justify-center items-center bg-gray-100/50">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                      )}
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el;

                          if (el) {
                            el.muted = true;
                            el.volume = 0;
                            el.dataset.feedVideoIndex = String(index);

                            el.addEventListener("loadedmetadata", () => {
                              setVideoRefsState((prev) => ({
                                ...prev,
                                [index]: el,
                              })); // Atualiza o estado para re-renderizar o componente
                            });
                            el.addEventListener("loadeddata", () => {
                              setVideoLoading((prev) => ({
                                ...prev,
                                [index]: false,
                              })); // Atualiza o estado para re-renderizar o componente
                            });

                            el.play().catch((error) => {
                              console.warn("Autoplay foi bloqueado", error);
                            });
                          }
                        }}
                        data-feed-video-index={index}
                        src={post.mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <VideoProgressBar
                        videoElement={videoRefsState[index]}
                        onFullscreen={() => setFullscreenImage(post)}
                      />
                    </div>
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt={`Post by ${post.profile.username}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setFullscreenImage(post)}
                    />
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No media available
                </div>
              )}
            </div>
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
        ))}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}
        {!hasMorePosts && (
          <div className="text-center text-gray-500 py-4">
            No more posts to load.
          </div>
        )}
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
            updateCommentCountInPost={updateCommentCountInPost}
          />
        )}
      </div>
      {fullscreenImage && (
        <ImageViewer
          post={fullscreenImage}
          commentsCount={commentsCount}
          setCommentsCount={setCommentsCount}
          onClose={() => setFullscreenImage(null)}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          userLikes={userLikes}
          updatePostInFeed={updatePostInFeed}
          setUserLikes={setUserLikes}
        />
      )}
    </>
  );
}
