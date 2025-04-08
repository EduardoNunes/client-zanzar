import { CircleAlert, CircleCheckBig, Check } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import SinglePostModal from "../components/SinglePostModal";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";
import { Preferences } from "@capacitor/preferences";
import {
  getNotificationsReq,
  markAllNotificationsAsReadReq,
  markNotificationAsReadReq,
} from "../requests/notificationsRequests";

interface Notification {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  referenceId: string;
}

const NotificationsPage = () => {
  const { profileId, isLoadingToken, token } = useGlobalContext();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isShowPost, setIsShowPost] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Ref para o observador de interseção
  const observer = useRef<IntersectionObserver | null>(null);

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
          const response = await getNotificationsReq(profileId);

          setNotifications(response.data);
          setHasMore(response.meta.hasMore);
          setTotalUnreadCount(response.meta.unreadCount);

          // Atualizar o contador no armazenamento
          const isMobile = /Mobi|Android/i.test(navigator.userAgent);
          const countStr = response.meta.unreadCount.toString();

          if (isMobile) {
            await Preferences.set({
              key: "unread_notifications",
              value: countStr,
            });
          } else {
            localStorage.setItem("unread_notifications", countStr);
          }
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [profileId]);

  // Função para carregar mais notificações quando o usuário rolar até o final
  const loadMoreNotifications = async () => {
    if (!profileId || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const response = await getNotificationsReq(profileId, nextPage);

      setNotifications((prev) => [...prev, ...response.data]);
      setPage(nextPage);
      setHasMore(response.meta.hasMore);
      setTotalUnreadCount(response.meta.unreadCount);
    } catch (error) {
      console.error("Erro ao carregar mais notificações:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Callback ref para o último elemento da lista
  const lastNotificationRef = useCallback(
    (node: HTMLLIElement | null) => {
      if (loading || loadingMore) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreNotifications();
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    if (profileId) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: profileId },
      });

      // Ouvir novas notificações
      newSocket.on("newNotification", async () => {
        // Resetar para a primeira página e recarregar
        const response = await getNotificationsReq(profileId, 1);
        setNotifications(response.data);
        setPage(1);
        setHasMore(response.meta.hasMore);
        setTotalUnreadCount(response.meta.unreadCount);

        // Atualizar o contador no armazenamento
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const countStr = response.meta.unreadCount.toString();

        if (isMobile) {
          await Preferences.set({
            key: "unread_notifications",
            value: countStr,
          });
        } else {
          localStorage.setItem("unread_notifications", countStr);
        }
      });

      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [profileId]);

  const openPost = async (notification: Notification) => {
    if (notification.isRead) {
      setPostId(notification.referenceId);
      setIsShowPost(true);
      return;
    }

    // Atualizar localmente a notificação como lida
    const updatedNotifications = notifications.map((n) =>
      n.id === notification.id ? { ...n, isRead: true } : n
    );
    setNotifications(updatedNotifications);

    try {
      // Fazer requisição para marcar como lida
      await markNotificationAsReadReq(notification.id);

      // Atualizar o contador de não lidas
      const newUnreadCount = totalUnreadCount > 0 ? totalUnreadCount - 1 : 0;
      setTotalUnreadCount(newUnreadCount);

      // Atualizar o contador no armazenamento
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const countStr = newUnreadCount.toString();

      if (isMobile) {
        await Preferences.set({
          key: "unread_notifications",
          value: countStr,
        });
      } else {
        localStorage.setItem("unread_notifications", countStr);
      }

      // Emitir evento para atualizar interface
      if (socket) {
        socket.emit("markAsRead", notification.id);
      }

      setPostId(notification.referenceId);
      setIsShowPost(true);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const closePost = () => {
    setIsShowPost(false);
    setPostId(null);
  };

  const markAllAsRead = async () => {
    if (!profileId || notifications.length === 0) return;

    try {
      await markAllNotificationsAsReadReq(profileId, token);

      // Atualizar localmente todas as notificações como lidas
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        isRead: true,
      }));

      setNotifications(updatedNotifications);
      setTotalUnreadCount(0);

      // Atualizar contador no armazenamento
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      if (isMobile) {
        await Preferences.set({
          key: "unread_notifications",
          value: "0",
        });
      } else {
        localStorage.setItem("unread_notifications", "0");
      }

      // Emitir evento para o socket
      if (socket) {
        socket.emit("markAllAsRead", profileId);
      }
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}
      <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold flex items-center">
            Notificações
            {totalUnreadCount > 0 && (
              <span className="ml-2 text-sm bg-red-500 text-white py-1 px-2 rounded-full">
                {totalUnreadCount}
              </span>
            )}
          </h1>
          {notifications.length > 0 && totalUnreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors ml-4"
            >
              <Check size={14} />
              <span>Marcar todas como lidas</span>
            </button>
          )}
        </div>

        {notifications.length === 0 && !loading ? (
          <p className="text-gray-500">Nenhuma notificação disponível.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {notifications.map((notification, index) => (
                <li
                  key={notification.id}
                  ref={
                    index === notifications.length - 1
                      ? lastNotificationRef
                      : null
                  }
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

                  <strong className="block text-lg">
                    {notification.content}
                  </strong>
                  <small className="text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>

            {loadingMore && (
              <div className="flex justify-center my-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            )}
          </>
        )}

        {isShowPost && postId && (
          <SinglePostModal
            postId={postId}
            onClose={closePost}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </>
  );
};

export default NotificationsPage;
