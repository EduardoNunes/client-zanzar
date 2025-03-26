import {
  Activity,
  Bell,
  Image,
  MessageSquare,
  Package,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdsCountReq,
  getMessagesCountReq,
  getPostsCountReq,
  getProductsCountReq,
  getTotalUsersReq,
} from "../requests/adminRequests";
import { useGlobalContext } from "../context/globalContext";

interface Stats {
  totalPosts: number;
  totalProducts: number;
  totalMessages: number;
  totalAds: number;
  totalUsers: number;
}

export default function Admin() {
  const { token } = useGlobalContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    totalProducts: 0,
    totalMessages: 0,
    totalAds: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [totalUsers, postsCount, productsCount, messagesCount, adsCount] =
        await Promise.all([
          getTotalUsersReq(token),
          getPostsCountReq(token),
          getProductsCountReq(token),
          getMessagesCountReq(token),
          getAdsCountReq(token),
        ]);

      setStats({
        totalUsers: totalUsers.count || 0,
        totalPosts: postsCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalMessages: messagesCount.count || 0,
        totalAds: adsCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: "Recent Activity",
      description: "Monitor user activity and engagement",
      icon: <Activity className="w-8 h-8 text-indigo-600" />,
      path: "/admin/activity",
      stat: stats.totalUsers,
      statLabel: "Total Users",
    },
    {
      title: "Users Management",
      description: "Manage users, roles, and permissions",
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      path: "/admin/users",
    },
    {
      title: "Posts Management",
      description: "Monitor and manage user posts",
      icon: <Image className="w-8 h-8 text-indigo-600" />,
      path: "/admin/posts",
      stat: stats.totalPosts,
      statLabel: "Total Posts",
    },
    {
      title: "Messages Management",
      description: "Monitor user communications",
      icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
      path: "/admin/messages",
      stat: stats.totalMessages,
      statLabel: "Total Messages",
    },
    {
      title: "Products Management",
      description: "Manage store products and inventory",
      icon: <Package className="w-8 h-8 text-indigo-600" />,
      path: "/admin/products",
      stat: stats.totalProducts,
      statLabel: "Total Products",
    },
    {
      title: "Advertisements",
      description: "Manage promotional content",
      icon: <Bell className="w-8 h-8 text-indigo-600" />,
      path: "/admin/ads",
      stat: stats.totalAds,
      statLabel: "Total Ads",
    },
    {
      title: "Invites Management",
      description: "Manage invite management",
      icon: <Bell className="w-8 h-8 text-indigo-600" />,
      path: "/admin/invites-management",
      stat: "",
      statLabel: "Total Invites",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module) => (
          <button
            key={module.path}
            onClick={() => navigate(module.path)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex flex-col items-start gap-4">
              {module.icon}
              <div>
                <h2 className="text-lg font-semibold">{module.title}</h2>
                <p className="text-gray-600 text-sm mt-1">
                  {module.description}
                </p>
                {module.stat !== undefined && (
                  <p className="text-indigo-600 font-semibold mt-2">
                    {module.statLabel}: {module.stat}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
