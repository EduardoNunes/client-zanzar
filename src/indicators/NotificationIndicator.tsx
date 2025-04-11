import { Preferences } from "@capacitor/preferences";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";

interface NotificationIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  unreadNotifications?: number;
  setUnreadNotifications?: (unreadNotifications: number) => void;
}

export const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  isMenuOpen,
  className,
  unreadNotifications,
  setUnreadNotifications,
}) => {
  const { profileId } = useGlobalContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Inicializar o contador de notificações não lidas
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      let notificationsStorage;
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const result = await Preferences.get({ key: "unread_notifications" });
        notificationsStorage = result.value;
      } else {
        notificationsStorage = localStorage.getItem("unread_notifications");
      }

      if (setUnreadNotifications) {
        const parsedValue = notificationsStorage
          ? parseInt(notificationsStorage, 10)
          : 0;
        setUnreadNotifications(parsedValue);
      }
    };

    fetchUnreadNotifications();
  }, [isMenuOpen, setUnreadNotifications]);

  // Socket conexão e tratamento de nova notificação
  useEffect(() => {
    if (profileId) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: profileId },
      });

      // Listener para novas notificações
      newSocket.on("newNotification", async () => {
        const newUnreadCount = (unreadNotifications ?? 0) + 1;

        if (setUnreadNotifications) {
          setUnreadNotifications(newUnreadCount);
        }

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
          await Preferences.set({
            key: "unread_notifications",
            value: newUnreadCount.toString(),
          });
        } else {
          localStorage.setItem(
            "unread_notifications",
            newUnreadCount.toString()
          );
        }
      });

      // Listener para atualizações de estatísticas
      newSocket.on(
        "userStatsUpdate",
        async (stats: { unreadNotifications: number }) => {
          if (setUnreadNotifications) {
            setUnreadNotifications(stats.unreadNotifications);
          }

          // Atualizar storage
          const isMobile = /Mobi|Android/i.test(navigator.userAgent);
          if (isMobile) {
            await Preferences.set({
              key: "unread_notifications",
              value: stats.unreadNotifications.toString(),
            });
          } else {
            localStorage.setItem(
              "unread_notifications",
              stats.unreadNotifications.toString()
            );
          }
        }
      );

      // Solicitar estatísticas ao conectar
      newSocket.emit("requestUserStats");

      setSocket(newSocket);
      return () => {
        newSocket.off("newNotification");
        newSocket.off("userStatsUpdate");
        newSocket.disconnect();
      };
    }
  }, [profileId, setUnreadNotifications, unreadNotifications]);

  // Listener para leitura de notificações
  useEffect(() => {
    if (socket) {
      /* socket.on("notificationRead", async () => {
        // Decrementar o contador de notificações não lidas
        if (unreadNotifications && unreadNotifications > 0) {
          const newUnreadCount = unreadNotifications - 1;

          if (setUnreadNotifications) {
            setUnreadNotifications(newUnreadCount);
          }

          const isMobile = /Mobi|Android/i.test(navigator.userAgent);
          if (isMobile) {
            await Preferences.set({
              key: "unread_notifications",
              value: newUnreadCount.toString(),
            });
          } else {
            localStorage.setItem(
              "unread_notifications",
              newUnreadCount.toString()
            );
          }
        }
      }); */

      socket.on("allNotificationsMarkedAsRead", async () => {
        if (setUnreadNotifications) {
          setUnreadNotifications(0);
        }

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) {
          await Preferences.set({
            key: "unread_notifications",
            value: "0",
          });
        } else {
          localStorage.setItem("unread_notifications", "0");
        }
      });

      return () => {
        socket.off("notificationRead");
        socket.off("allNotificationsMarkedAsRead");
      };
    }
  }, [socket, unreadNotifications, setUnreadNotifications]);

  if (!unreadNotifications || unreadNotifications <= 0) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs ${className}`}
      style={{
        transition: "transform 0.3s ease-in-out",
        transform: "rotate(270deg)",
      }}
    >
      {unreadNotifications}
    </div>
  );
};
