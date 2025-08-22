import { useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { useSocket } from "../hooks/useSocket";
import { useGlobalContext } from "../context/globalContext";

interface MessageIndicatorProps {
  isMenuOpen?: boolean;
  unreadChatsCount?: number;
  setUnreadChatsCount?: (count: number) => void;
}

export const MessageIndicator = ({
  isMenuOpen,
  unreadChatsCount,
  setUnreadChatsCount,
}: MessageIndicatorProps) => {
  const { profileId } = useGlobalContext();
  const socket = useSocket();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const fetchStorage = async () => {
      const result = isMobile
        ? await Preferences.get({ key: "unread_chat_messages" })
        : { value: localStorage.getItem("unread_chat_messages") };
      setUnreadChatsCount?.(result.value ? parseInt(result.value, 10) : 0);
    };
    fetchStorage();
  }, [isMenuOpen, setUnreadChatsCount, isMobile]);

  useEffect(() => {
    if (!socket || !profileId) return;

    const handleNewMessage = (message: any) => {
      if (message.profileId !== profileId) {
        socket.emit("getUnreadChatsCount");
      }
    };

    const handleUnreadCount = (data: { count: number }) => {
      setUnreadChatsCount?.(data.count);
      if (isMobile) {
        Preferences.set({
          key: "unread_chat_messages",
          value: data.count.toString(),
        });
      } else {
        localStorage.setItem("unread_chat_messages", data.count.toString());
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("unreadChatsCount", handleUnreadCount);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("unreadChatsCount", handleUnreadCount);
    };
  }, [socket, profileId, setUnreadChatsCount, isMobile]);

  if (!unreadChatsCount || unreadChatsCount <= 0) return null;

  return (
    <div className="absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs rotate-270">
      {unreadChatsCount}
    </div>
  );
};
