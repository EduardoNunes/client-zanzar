import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  getPostsByCategoryReq,
  getPostsReq,
} from "../requests/profileRequests";
import CommentModal from "./CommentsModal";
import ImageViewer from "./ImageViewer";

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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [postsByCategory, setPostsByCategory] = useState<PostsByCategory>({});
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>(
    {}
  ); // Track pages for each category
  const [categoryLoading, setCategoryLoading] = useState<
    Record<string, boolean>
  >({}); //prevent duplicate request

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
        className="rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in relative w-48 shrink-0"
      >
        <div className="relative w-full aspect-square">
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
            onClick={() => setFullscreenImage(post.mediaUrl)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {Object.entries(postsByCategory).map(([category, posts]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold mb-4">{category}</h2>
          <div
            className="flex overflow-x-auto space-x-4 p-4"
            onScroll={(e) =>
              handleCategoryScroll(category, posts[0].category.id, e)
            }
          >
            {posts.map((post) => renderPost(post))}
          </div>
        </div>
      ))}

      {allPosts.length === 0 && (
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
