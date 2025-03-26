import { CircleAlert, CircleCheckBig } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import SinglePostModal from "../components/SinglePostModal";
import api from "../server/axios";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";

interface Notification {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  referenceId: string;
}

const NotificationsPage = () => {
  const {
    profileId,
    isLoadingToken,
    unreadNotifications,
    setUnreadNotifications,
  } = useGlobalContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isShowPost, setIsShowPost] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingToken && !profileId) {
      navigate("/login");
    }
  }, [isLoadingToken, profileId, navigate]);

  useEffect(() => {
    if (profileId) {
      const fetchNotifications = async () => {
        try {
          setLoading(true);
          const res = await api.get(`/notifications/read-all/${profileId}`);
          setNotifications(res.data);
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: profileId },
      });

      newSocket.on("newNotification", (newNotification: Notification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadNotifications(
          unreadNotifications !== null ? unreadNotifications + 1 : 1
        );
      });

      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [profileId, setUnreadNotifications]);

  const markNotificationAsRead = (notificationId: string) => {
    if (socket) {
      socket.emit("markAsRead", notificationId);

      // Update unread notifications count
      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
      setUnreadNotifications(unreadCount);
    }
  };

  const openPost = (notification: Notification) => {
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, isRead: true } : n
    );

    setNotifications(updatedNotifications);

    // Update unread notifications count
    const unreadCount = updatedNotifications.filter((n) => !n.isRead).length;
    setUnreadNotifications(unreadCount);

    setPostId(notification.referenceId);
    setIsShowPost(true);
    markNotificationAsRead(notification.id);
  };

  const closePost = () => {
    setIsShowPost(false);
    setPostId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Notificações</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">Nenhuma notificação disponível.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification, index) => (
            <li
              key={index}
              className="p-4 bg-gray-100 border rounded-lg shadow-sm cursor-pointer relative"
              onClick={() => openPost(notification)}
            >
              <div className="absolute top-4 right-4">
                {notification.isRead ? (
                  <span className="w-6 h-6 text-green-500 text-lg">
                    <CircleCheckBig />
                  </span>
                ) : (
                  <span className="w-6 h-6 text-red-500 rounded-full">
                    <CircleAlert />
                  </span>
                )}
              </div>

              <strong className="block text-lg">{notification.content}</strong>
              <small className="text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
      {isShowPost && postId && (
        <SinglePostModal postId={postId} onClose={closePost} />
      )}
    </div>
  );
};

export default NotificationsPage;
