import React, { useRef, useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import { CircleUserRound, Heart, LogIn, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CommentModal from "../components/CommentsModal";
import ImageViewer from "../components/ImageViewer";
import VideoProgressBar from "../components/VideoProgressBar";
import { getFeedReq, handleLikeReq } from "../requests/feedRequests";

interface Post {
  commentCount: number;
  likeCount: number;
  likedByLoggedInUser: boolean;
  createdAt: string | number | Date;
  id: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const token = Cookies.get("access_token");

  // Refs for Intersection Observer
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Cleanup function for observer
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  // Setup Intersection Observer
  useEffect(() => {
    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          
          if (!entry.isIntersecting) {
            // Video is not in view
            videoElement.pause();
            videoElement.muted = true;
            videoElement.currentTime = 0;
          } else {
            // Video is in view
            videoElement.play().catch(() => {
              console.warn('Autoplay prevented');
            });
          }
        });
      },
      {
        threshold: 0.5, // Trigger when at least 50% of the video is visible
      }
    );

    // Observe videos
    videoRefs.current.forEach((videoEl) => {
      if (videoEl) {
        observerRef.current?.observe(videoEl);
      }
    });

    // Cleanup
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

      // Determine media type for each post
      const processedPosts = data.map((post: Post) => {
        // You might want to adjust this logic based on how you store media type in the backend
        const isVideo = post.mediaUrl.includes('/videos/') || 
                        post.mediaUrl.includes('.mp4') || 
                        post.mediaUrl.includes('video');
        
        return {
          ...post,
          mediaType: isVideo ? 'video' : 'image'
        };
      });

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

      // Determine media type for each post
      const processedPosts = newPosts.map((post: Post) => {
        const isVideo = post.mediaUrl.includes('/videos/') || 
                        post.mediaUrl.includes('.mp4') || 
                        post.mediaUrl.includes('video');
        
        return {
          ...post,
          mediaType: isVideo ? 'video' : 'image'
        };
      });

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

  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
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
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative w-full aspect-square bg-gray-100">
              {post.mediaUrl ? (
                <div className="relative w-full h-full">
                  {post.mediaType === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        ref={(el) => {
                          // Store video refs for Intersection Observer
                          videoRefs.current[index] = el;
                          
                          if (el) {
                            // Ensure video is completely muted initially
                            el.muted = true;
                            el.volume = 0;
                            
                            // Add unique identifier for each video
                            el.dataset.feedVideoIndex = String(index);
                            
                            // Attempt to play with error handling
                            el.play().catch((error) => {
                              console.warn('Autoplay was prevented', error);
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
                        videoElement={document.querySelector(`video[data-feed-video-index="${index}"]`) as HTMLVideoElement} 
                        onFullscreen={() => setFullscreenImage(post.mediaUrl)}
                      />
                    </div>
                  ) : (
                    <img
                      src={post.mediaUrl}
                      alt={`Post by ${post.profile.username}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setFullscreenImage(post.mediaUrl)}
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
      {fullscreenImage && (
        <ImageViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </>
  );
}
