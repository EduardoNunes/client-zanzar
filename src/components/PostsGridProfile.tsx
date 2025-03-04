import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  getPostsByCategoryReq,
  getPostsReq,
} from "../requests/profileRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";
import { FileImage } from "lucide-react";

interface Post {
  category: { categories: string; id: string };
  likedByLoggedInUser: boolean;
  likeCount: number;
  commentCount: number;
  id: string;
  mediaUrl: string | null;
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<Post | null>(null);
  const [postsByCategory, setPostsByCategory] = useState<PostsByCategory>({});
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>(
    {}
  ); // Track pages for each category
  const [categoryLoading, setCategoryLoading] = useState<
    Record<string, boolean>
  >({}); //Prevê requisição duplicada
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  let scrollTriggered = false;

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
      if (username) {
        const initialPosts = await getPostsReq(username, 1);

        if (initialPosts) {
          setAllPosts(initialPosts);

          const likesMap = initialPosts.reduce(
            (acc: Record<string, boolean>, post: Post) => {
              acc[post.id] = post.likedByLoggedInUser || false;
              return acc;
            },
            {}
          );
          setUserLikes(likesMap);
          const grouped = groupPostsByCategory(initialPosts);
          setPostsByCategory(grouped);

          // Initialize page numbers for each category
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
      if (username) {
        const newPosts = await getPostsReq(username, page + 1);
        if (newPosts && newPosts.length > 0) {
          setAllPosts((prevPosts) => [...prevPosts, ...newPosts]);
          setPage((prevPage) => prevPage + 1);
          const newLikesMap = newPosts.reduce(
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
          // Append new categories to the existing postsByCategory
          setPostsByCategory((prevPostsByCategory) => {
            const newPostsByCategory = groupPostsByCategory(newPosts);
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
    const profileId = Cookies.get("profile_id");
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
          nextPage
        );
        if (newPosts && newPosts.length > 0) {
          setPostsByCategory((prevPosts) => ({
            ...prevPosts,
            [category]: [...(prevPosts[category] || []), ...newPosts],
          }));
          setCategoryPages((prevPages) => ({
            ...prevPages,
            [category]: nextPage,
          }));
          const newLikesMap = newPosts.reduce(
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

  const renderPost = (post: Post) => {
    return (
      <div
        key={post.id}
        className="overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in relative w-1/3 shrink-0"
      >
        <div className="relative w-full aspect-[9/14]">
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
            Adicionar midia
          </div>
        </div>
      </div>
    );
  };

  const updatePostInFeed = (postId: string, newPost: any) => {
    setAllPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likeCount: newPost.likesCount } : post
      )
    );
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
              {posts.map((post) => renderPost(post))}
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

      {fullscreenImage && (
        <ImageViewer
          post={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
          userLikes={userLikes}
          setUserLikes={setUserLikes}
          updatePostInFeed={updatePostInFeed}
          setSelectedPost={setSelectedPost}
          selectedPost={selectedPost}
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
          />
        )}
      </div>
    </div>
  );
}
