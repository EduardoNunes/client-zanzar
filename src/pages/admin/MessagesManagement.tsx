import { Activity, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Message, MessageStats, getAllMessagesReq, getMessages24hCountReq, getMessages30dCountReq, getMessages7dCountReq, getMessagesCountReq } from '../../requests/messagesManagementRequests';

export default function MessagesManagement() {
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    messages24h: 0,
    messages7d: 0,
    messages30d: 0
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchMessages();
  }, []);

  const fetchStats = async () => {
    try {
      const [totalMessages, messages24h, messages7d, messages30d] = await Promise.all([
        getMessagesCountReq(),
        getMessages24hCountReq(),
        getMessages7dCountReq(),
        getMessages30dCountReq()
      ]);

      setStats({
        totalMessages,
        messages24h,
        messages7d,
        messages30d
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await getAllMessagesReq();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Messages Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Messages</h3>
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMessages}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 24h</h3>
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.messages24h}</p>
          <p className="text-sm text-gray-500 mt-2">
            {((stats.messages24h / stats.totalMessages) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 7 Days</h3>
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.messages7d}</p>
          <p className="text-sm text-gray-500 mt-2">
            {((stats.messages7d / stats.totalMessages) * 100).toFixed(1)}% of total
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 30 Days</h3>
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.messages30d}</p>
          <p className="text-sm text-gray-500 mt-2">
            {((stats.messages30d / stats.totalMessages) * 100).toFixed(1)}% of total
          </p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                            : message.receiver.charAt(0).toUpperCase()
                          }
                        </span>
                      </div>
                      <span className="ml-3 font-medium text-gray-900">
                        {Array.isArray(message.receiver)
                          ? message.receiver.join(', ')
                          : message.receiver
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2">{message.content}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}