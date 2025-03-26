import { Activity, ChevronLeft, ChevronRight, Image, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Post,
  getAllPostsReq,
  getPosts24hCountReq,
  getPosts30dCountReq,
  getPosts7dCountReq,
  getPostsCountReq,
} from "../../requests/postsManagementRequests";
import { useGlobalContext } from "../../context/globalContext";
import { toast } from "react-toastify";

interface PostStats {
  totalPosts: number;
  posts24h: number;
  posts7d: number;
  posts30d: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export default function PostsManagement() {
  const { token, isLoadingToken } = useGlobalContext();
  const [stats, setStats] = useState<PostStats>({
    totalPosts: 0,
    posts24h: 0,
    posts7d: 0,
    posts30d: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });

  useEffect(() => {
    if (!isLoadingToken && !token) {
      toast.error("Token not found");
      return;
    }
  }, [isLoadingToken, token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchPosts(currentPage);
    }
  }, [token, currentPage]);

  const fetchStats = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      const [totalPosts, posts24h, posts7d, posts30d] = await Promise.all([
        getPostsCountReq(token),
        getPosts24hCountReq(token),
        getPosts7dCountReq(token),
        getPosts30dCountReq(token),
      ]);

      setStats({
        totalPosts,
        posts24h,
        posts7d,
        posts30d,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error fetching stats");
    }
  };

  const fetchPosts = async (page: number) => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      setLoading(true);
      const response = await getAllPostsReq(page, token);
      setPosts(response.posts);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Posts Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Posts</h3>
            <Image className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 24h</h3>
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.posts24h}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalPosts > 0
              ? ((stats.posts24h / stats.totalPosts) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 7 Days</h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.posts7d}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalPosts > 0
              ? ((stats.posts7d / stats.totalPosts) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Last 30 Days
            </h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.posts30d}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalPosts > 0
              ? ((stats.posts30d / stats.totalPosts) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No posts found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={post.mediaUrl}
                  alt="Post"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {post.profile.username}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{post.caption}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{post.likes.length} likes</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasMore}
              className={`flex items-center gap-1 px-4 py-2 rounded-md ${
                !pagination.hasMore
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
