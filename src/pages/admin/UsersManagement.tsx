import { Activity, Users, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  UserProfile,
  UserStats,
  getActiveUsers24hReq,
  getActiveUsers30dReq,
  getActiveUsers7dReq,
  getAllUsersReq,
  getUsersCountReq,
} from "../../requests/usersManagementRequests";
import { useGlobalContext } from "../../context/globalContext";
import { toast } from "react-toastify";

export default function UsersManagement() {
  const { token, isLoadingToken } = useGlobalContext();
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers24h: 0,
    activeUsers7d: 0,
    activeUsers30d: 0,
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingToken && !token) {
      toast.error("Token not found");
      return;
    }
  }, [isLoadingToken, token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
    }
  }, [token, currentPage]);

  const fetchStats = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      const [
        totalUsersRes,
        activeUsers24hRes,
        activeUsers7dRes,
        activeUsers30dRes,
      ] = await Promise.all([
        getUsersCountReq(token),
        getActiveUsers24hReq(token),
        getActiveUsers7dReq(token),
        getActiveUsers30dReq(token),
      ]);

      setStats({
        totalUsers: totalUsersRes.count || 0,
        activeUsers24h: activeUsers24hRes.count || 0,
        activeUsers7d: activeUsers7dRes.count || 0,
        activeUsers30d: activeUsers30dRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error fetching stats");
    }
  };

  const fetchUsers = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      setLoading(true);
      const response = await getAllUsersReq(currentPage, token);
      setUsers(response.users);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Users Management</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Active 24h</h3>
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeUsers24h}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalUsers > 0
              ? ((stats.activeUsers24h / stats.totalUsers) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Active 7 Days
            </h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeUsers7d}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalUsers > 0
              ? ((stats.activeUsers7d / stats.totalUsers) * 100).toFixed(1)
              : "0.0"}
            % do total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Ativo 30 dias
            </h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeUsers30d}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalUsers > 0
              ? ((stats.activeUsers30d / stats.totalUsers) * 100).toFixed(1)
              : "0.0"}
            % do total
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="custom-thead-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
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
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastSignInAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav
                className="relative inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
