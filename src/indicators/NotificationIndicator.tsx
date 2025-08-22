import { useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { useSocket } from "../hooks/useSocket";
import { useGlobalContext } from "../context/globalContext";

interface NotificationIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  unreadNotifications?: number;
  setUnreadNotifications?: (count: number) => void;
}

export const NotificationIndicator = ({
  className,
  isMenuOpen,
  unreadNotifications,
  setUnreadNotifications,
}: NotificationIndicatorProps) => {
  const { profileId } = useGlobalContext();
  const socket = useSocket();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      const result = isMobile
        ? await Preferences.get({ key: "unread_notifications" })
        : { value: localStorage.getItem("unread_notifications") };
      const parsed = result.value ? parseInt(result.value, 10) : 0;
      setUnreadNotifications?.(parsed);
    };
    fetchUnreadNotifications();
  }, [isMenuOpen, setUnreadNotifications, isMobile]);

  useEffect(() => {
    if (!socket || !profileId) return;

    const handleNewNotification = (data: any) => {
      const newCount = (unreadNotifications ?? 0) + 1;
      setUnreadNotifications?.(newCount);
      if (isMobile) {
        Preferences.set({
          key: "unread_notifications",
          value: newCount.toString(),
        });
      } else {
        localStorage.setItem("unread_notifications", newCount.toString());
      }
    };

    const handleStatsUpdate = (data: { unreadNotifications: number }) => {
      setUnreadNotifications?.(data.unreadNotifications);
      if (isMobile) {
        Preferences.set({
          key: "unread_notifications",
          value: data.unreadNotifications.toString(),
        });
      } else {
        localStorage.setItem(
          "unread_notifications",
          data.unreadNotifications.toString()
        );
      }
    };

    socket.on("newNotification", handleNewNotification);
    socket.on("userStatsUpdate", handleStatsUpdate);

    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("userStatsUpdate", handleStatsUpdate);
    };
  }, [
    socket,
    profileId,
    unreadNotifications,
    setUnreadNotifications,
    isMobile,
  ]);

  if (!unreadNotifications || unreadNotifications <= 0) return null;

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
