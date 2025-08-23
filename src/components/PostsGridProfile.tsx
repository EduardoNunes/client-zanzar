import { FileImage } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPostsByCategoryReq,
  getPostsReq,
} from "../requests/profileRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";
import { useGlobalContext } from "../context/globalContext";

interface Post {
  category: { categories: string; id: string };
  likedByLoggedInUser: boolean;
  likeCount: number;
  commentCount: number;
  id: string;
  mediaUrl: string | null;
  mediaType?: "image" | "video";
  caption: string;
  createdAt: string;
  comments: { id: string; profile: { username: string }; content: string }[];
  post: string;
}

interface PostsGridProfileProps {
  username: string | undefined;
}

interface PostsByCategory {
  [category: string]: Post[];
}

export default function PostsGridProfile({ username }: PostsGridProfileProps) {
  const { profileId, token } = useGlobalContext();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<Post | null>(null);
  const [postsByCategory, setPostsByCategory] = useState<PostsByCategory>({});
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>(
    {}
  ); // páginas de cada categoria
  const [categoryLoading, setCategoryLoading] = useState<
    Record<string, boolean>
  >({}); //Prevê requisição duplicada
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>(
    {}
  );

  // Refs para os elementos de vídeo
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  let scrollTriggered = false;

  // limpa o observer
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // configurar o observer
  useEffect(() => {
    // cria o observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting) {
            // Video não está visível
            videoElement.pause();
            videoElement.muted = true;
            videoElement.currentTime = 0;
          } else {
            // Video está visível
            videoElement.play().catch(() => {
              console.warn("Autoplay prevented");
            });
          }
        });
      },
      {
        threshold: 0.3, // aciona quando 30% do vídeo está visível
      }
    );

    // Observa videos
    videoRefs.current.forEach((videoEl) => {
      if (videoEl) {
        observerRef.current?.observe(videoEl);
      }
    });

    return cleanupObserver;
  }, [allPosts, cleanupObserver]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
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
      if (username && profileId) {
        const initialPosts = await getPostsReq(username, 1, token, profileId);

        const processedPosts = initialPosts.map((post: Post) => {
          // verificar se a string contém uma substring
          const isVideo =
            post.mediaUrl?.includes("/videos/") ||
            post.mediaUrl?.includes(".mp4") ||
            post.mediaUrl?.includes("video");

          return {
            ...post,
            mediaType: isVideo ? "video" : "image",
          };
        });

        const initialVideoLoadingState = processedPosts.reduce(
          (acc: { [key: number]: boolean }, _: any, index: number) => {
            acc[index] = true; // inicialmente carregando todos os vídeos
            return acc;
          },
          {}
        );

        setVideoLoading(initialVideoLoadingState);

        if (initialPosts) {
          setAllPosts(processedPosts);

          const likesMap = processedPosts.reduce(
            (acc: Record<string, boolean>, post: Post) => {
              acc[post.id] = post.likedByLoggedInUser || false;
              return acc;
            },
            {}
          );

          setUserLikes(likesMap);
          const grouped = groupPostsByCategory(processedPosts);
          setPostsByCategory(grouped);

          // inicializa as páginas de cada categoria
          const initialCategoryPages: Record<string, number> = {};
          Object.keys(grouped).forEach((category) => {
            initialCategoryPages[category] = 1;
          });

          setCategoryPages(initialCategoryPages);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      if (username && profileId) {
        const newPosts = await getPostsReq(
          username,
          page + 1,
          token,
          profileId
        );

        // determina se o post é um vídeo
        const processedPosts = newPosts.map((post: Post) => {
          const isVideo =
            post.mediaUrl?.includes("/videos/") ||
            post.mediaUrl?.includes(".mp4") ||
            post.mediaUrl?.includes("video");

          return {
            ...post,
            mediaType: isVideo ? "video" : "image",
          };
        });

        const newVideoLoadingState = processedPosts.reduce(
          (acc: { [key: number]: boolean }, _: any, index: number) => {
            acc[index + allPosts.length] = true; // Initially loading for all new videos, considering the index shift
            return acc;
          },
          {}
        );

        setVideoLoading((prev) => ({ ...prev, ...newVideoLoadingState }));

        if (newPosts && newPosts.length > 0) {
          setAllPosts((prevPosts) => [...prevPosts, ...processedPosts]);
          setPage((prevPage) => prevPage + 1);
          const newLikesMap = processedPosts.reduce(
            (acc: Record<string, boolean>, post: Post) => {
              acc[post.id] = post.likedByLoggedInUser || false;
              return acc;
            },
            {}
          );
          setUserLikes((prevLikes) => ({
            ...prevLikes,
            ...newLikesMap,
          }));

          // anexa novos posts à categoria existente
          setPostsByCategory((prevPostsByCategory) => {
            const newPostsByCategory = groupPostsByCategory(processedPosts);
            return { ...prevPostsByCategory, ...newPostsByCategory };
          });
        }
      } else {
        setLoadingMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const groupPostsByCategory = (posts: Post[]): PostsByCategory => {
    const grouped: PostsByCategory = {};
    posts.forEach((post) => {
      const category = post.category.categories;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(post);
    });
    return grouped;
  };

  const handleCategoryScroll = async (
    category: string,
    categoryId: string,
    event: React.UIEvent<HTMLDivElement>
  ) => {
    const element = event.currentTarget;
    if (!profileId || categoryLoading[category]) return;

    if (element.scrollWidth - element.scrollLeft - element.clientWidth < 10) {
      setCategoryLoading((prevLoading) => ({
        ...prevLoading,
        [category]: true,
      }));

      const nextPage = (categoryPages[category] || 1) + 1;

      try {
        const newPosts = await getPostsByCategoryReq(
          categoryId,
          profileId,
          nextPage,
          token
        );

        const processedPosts = newPosts.map((post: Post) => {
          const isVideo =
            post.mediaUrl?.includes("/videos/") ||
            post.mediaUrl?.includes(".mp4") ||
            post.mediaUrl?.includes("video");

          return {
            ...post,
            mediaType: isVideo ? "video" : "image",
          };
        });

        if (processedPosts && processedPosts.length > 0) {
          setPostsByCategory((prevPosts) => ({
            ...prevPosts,
            [category]: [...(prevPosts[category] || []), ...processedPosts],
          }));

          setCategoryPages((prevPages) => ({
            ...prevPages,
            [category]: nextPage,
          }));

          const newLikesMap = processedPosts.reduce(
            (acc: Record<string, boolean>, post: Post) => {
              acc[post.id] = post.likedByLoggedInUser || false;
              return acc;
            },
            {}
          );
          setUserLikes((prevLikes) => ({
            ...prevLikes,
            ...newLikesMap,
          }));
        }
      } catch (error) {
        console.error("Error loading more posts for category:", error);
      } finally {
        setCategoryLoading((prevLoading) => ({
          ...prevLoading,
          [category]: false,
        }));
      }
    }
  };

  const renderPost = (post: Post, index: number) => {
    return (
      <div
        key={post.id}
        className="overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in relative w-1/3 shrink-0"
      >
        <div className="relative w-full aspect-[9/14]">
          {post.mediaType === "video" ? (
            <div className="relative w-full h-full">
              {videoLoading[index] && (
                <div className="absolute inset-0 z-2 flex justify-center items-center bg-gray-100/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                </div>
              )}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;

                  if (el) {
                    el.muted = true;
                    el.volume = 0;
                    el.dataset.feedVideoIndex = String(index);

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
                src={post.mediaUrl || ""}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                onClick={() => setFullscreenImage(post)}
              />
            </div>
          ) : (
            <>
              <img
                src={post.mediaUrl || ""}
                alt={post.caption}
                className="w-full h-full object-cover opacity-0"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const spinner = img.nextElementSibling as HTMLDivElement;
                  img.classList.remove("opacity-0");
                  spinner.classList.add("hidden");
                }}
                onError={(e) => {
                  const img = e.currentTarget;
                  const spinner = img.nextElementSibling as HTMLDivElement;
                  img.classList.add("opacity-0");
                  spinner.classList.add("hidden");
                }}
                onClick={() => setFullscreenImage(post)}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPlaceholder = (category: string, index: number) => {
    return (
      <div
        key={`placeholder-${category}-${index}`}
        className="overflow-hidden bg-gray-200 relative w-1/3 shrink-0"
      >
        <div className="relative w-full aspect-[9/14] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2 opacity-30 text-gray-500 text-center">
            <FileImage size={36} />
          </div>
        </div>
      </div>
    );
  };

  const updatePostInFeed = useCallback((postId: string, newPost: any) => {
    // Atualiza allPosts
    setAllPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likeCount: newPost.likesCount,
              likedByLoggedInUser: newPost.likedByLoggedInUser,
            }
          : post
      )
    );

    // Atualiza postsByCategory
    setPostsByCategory((prevPostsByCategory) => {
      const updatedPostsByCategory = { ...prevPostsByCategory };
      for (const category in updatedPostsByCategory) {
        updatedPostsByCategory[category] = updatedPostsByCategory[category].map(
          (post) =>
            post.id === postId
              ? {
                  ...post,
                  likeCount: newPost.likesCount,
                  likedByLoggedInUser: newPost.likedByLoggedInUser,
                }
              : post
        );
      }
      return updatedPostsByCategory;
    });

    // Atualiza fullscreenImage se estiver aberto
    setFullscreenImage((prevImage) =>
      prevImage && prevImage.id === postId
        ? {
            ...prevImage,
            likeCount: newPost.likesCount,
            likedByLoggedInUser: newPost.likedByLoggedInUser,
          }
        : prevImage
    );

    // Atualiza selectedPost se estiver aberto
    setSelectedPost((prevPost) =>
      prevPost && prevPost.id === postId
        ? {
            ...prevPost,
            likeCount: newPost.likesCount,
            likedByLoggedInUser: newPost.likedByLoggedInUser,
          }
        : prevPost
    );

    // Atualiza userLikes
    setUserLikes((prevLikes) => ({
      ...prevLikes,
      [postId]: newPost.likedByLoggedInUser,
    }));
  }, []);

  const updateCommentCountInPost = (
    postId: string,
    newCommentCount: number
  ) => {
    setCommentsCount((prev) => ({
      ...prev,
      [postId]: newCommentCount,
    }));
    setAllPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentCount: newCommentCount } : post
      )
    );

    setPostsByCategory((prevPostsByCategory) => {
      const updatedPostsByCategory = { ...prevPostsByCategory };

      for (const category in updatedPostsByCategory) {
        updatedPostsByCategory[category] = updatedPostsByCategory[category].map(
          (post) => {
            if (post.id === postId) {
              return { ...post, commentCount: newCommentCount };
            }
            return post;
          }
        );
      }
      return updatedPostsByCategory;
    });
  };

  return (
    <div>
      {Object.entries(postsByCategory).map(([category, posts]) => {
        const placeholders = Array.from(
          { length: Math.max(0, 3 - posts.length) },
          (_, i) => renderPlaceholder(category, i)
        );
        return (
          <div key={category} className="mb-2">
            <h2 className="text-xl font-bold mb-1">{category}</h2>
            <div
              className="flex overflow-x-auto space-x-[2px]"
              onScroll={(e) =>
                handleCategoryScroll(category, posts[0]?.category.id, e)
              }
            >
              {posts.map((post, index) => renderPost(post, index))}
              {placeholders}
            </div>
          </div>
        );
      })}

      {allPosts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhuma postagem ainda
        </div>
      )}

      {fullscreenImage && fullscreenImage.mediaUrl && (
        <ImageViewer
          post={{
            id: fullscreenImage.id,
            mediaUrl: fullscreenImage.mediaUrl,
            mediaType: fullscreenImage.mediaType,
            caption: fullscreenImage.caption || "",
            likeCount: fullscreenImage.likeCount,
            likedByLoggedInUser: userLikes[fullscreenImage.id] || false,
            commentCount: fullscreenImage.commentCount,
          }}
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

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loadingMore && allPosts.length > 0 && (
        <div className="text-center text-gray-500 py-4">
          No more posts to load.
        </div>
      )}
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
    </div>
  );
}
