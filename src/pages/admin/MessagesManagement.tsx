import { Activity, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Message,
  MessageStats,
  getAllMessagesReq,
  getMessages24hCountReq,
  getMessages30dCountReq,
  getMessages7dCountReq,
  getMessagesCountReq,
  PaginatedResponse,
} from "../../requests/messagesManagementRequests";
import { useGlobalContext } from "../../context/globalContext";
import { toast } from "react-toastify";

export default function MessagesManagement() {
  const { token, isLoadingToken } = useGlobalContext();
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    messages24h: 0,
    messages7d: 0,
    messages30d: 0,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isLoadingToken && !token) {
      toast.error("Token not found");
      return;
    }
  }, [isLoadingToken, token]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchMessages();
    }
  }, [token, page]);

  const fetchStats = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      const [totalMessages, messages24h, messages7d, messages30d] =
        await Promise.all([
          getMessagesCountReq(token),
          getMessages24hCountReq(token),
          getMessages7dCountReq(token),
          getMessages30dCountReq(token),
        ]);

      setStats({
        totalMessages,
        messages24h,
        messages7d,
        messages30d,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Error fetching stats");
    }
  };

  const fetchMessages = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      setLoading(true);
      const data: PaginatedResponse = await getAllMessagesReq(page, token);
      setMessages(data.messages || []);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Messages Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Messages
            </h3>
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalMessages}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 24h</h3>
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats.messages24h}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalMessages > 0
              ? ((stats.messages24h / stats.totalMessages) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 7 Days</h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.messages7d}</p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalMessages > 0
              ? ((stats.messages7d / stats.totalMessages) * 100).toFixed(1)
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
          <p className="text-3xl font-bold text-gray-900">
            {stats.messages30d}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalMessages > 0
              ? ((stats.messages30d / stats.totalMessages) * 100).toFixed(1)
              : "0.0"}
            % of total
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No messages found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {message.sender.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-3 font-medium text-gray-900">
                          {message.sender}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-medium">
                            {Array.isArray(message.receiver)
                              ? message.receiver[0].charAt(0).toUpperCase()
                              : message.receiver.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="ml-3 font-medium text-gray-900">
                          {Array.isArray(message.receiver)
                            ? message.receiver.join(", ")
                            : message.receiver}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        {message.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 rounded-md border ${
                  pageNumber === page
                    ? "bg-blue-500 text-white"
                    : "border-gray-300"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
