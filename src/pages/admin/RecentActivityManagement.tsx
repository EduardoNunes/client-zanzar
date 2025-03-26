import { formatDistanceToNow } from "date-fns";
import { Activity, Clock, Users, Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ActivityStats,
  getActivityStatsReq,
  getUsersActivityReq,
  UserActivity,
} from "../../requests/recentActivityManagementRequests";
import { useGlobalContext } from "../../context/globalContext";

export default function RecentActivityManagement() {
  const { token, isLoadingToken } = useGlobalContext();
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ActivityStats>({
    totalActiveToday: 0,
    totalActiveWeek: 0,
    averageSessionsPerDay: 0,
  });

  useEffect(() => {
    if (!isLoadingToken && !token) {
      toast.error("Token not found");
      return;
    }
  }, [isLoadingToken, token]);

  useEffect(() => {
    if (token) {
      fetchUsersActivity();
      fetchActivityStats();
    }
  }, [token]);

  const fetchUsersActivity = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      setLoading(true);
      const usersData = await getUsersActivityReq(token);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      toast.error("Failed to fetch user activity");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      const statsData = await getActivityStatsReq(token);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      toast.error("Failed to fetch activity stats");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Recent User Activity</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Active Today
            </h3>
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalActiveToday}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Active This Week
            </h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalActiveWeek}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Avg. Sessions/Day
            </h3>
            <Clock className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.averageSessionsPerDay}
          </p>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "#6b7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Since
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-3 font-medium text-gray-900">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.last_sign_in_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.total_posts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.total_messages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 text-red-500 mr-1" />
                        {user.total_likes}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
