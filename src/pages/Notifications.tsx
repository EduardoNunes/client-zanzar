import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import api from "../server/axios";
import SinglePostModal from "../components/SinglePostModal";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profileId, setProfileId] = useState("");
  const [isShowPost, setIsShowPost] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    const profile = Cookies.get("profile_id");
    if (!profile) {
      navigate("/login");
    }
    setProfileId(profile || "");
  }, []);

  useEffect(() => {
    if (profileId) {
      const fetchNotifications = async () => {
        console.log("PROFILEID", profileId);
        try {
          const res = await api.get(`/notifications/read-all/${profileId}`);

          setNotifications(res.data);
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
        }
      };
      
      fetchNotifications();
    }
  }, [profileId]);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      query: { userId: profileId },
    });
    socket.on("newNotification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });
    return () => {
      socket.disconnect();
    };
  }, [profileId]);

  const openPost = (postId: string) => {
    setPostId(postId);
    setIsShowPost(true);
  };

  const closePost = () => {
    setIsShowPost(false);
    setPostId(null);
  };

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
              className="p-4 bg-gray-100 border rounded-lg shadow-sm cursor-pointer"
              onClick={() => openPost(notification.referenceId)}
            >
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
