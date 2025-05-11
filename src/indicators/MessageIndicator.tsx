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
  const socket = useSocket();
  const { profileId } = useGlobalContext();
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const fetchStorage = async () => {
      const result = isMobile
        ? await Preferences.get({ key: "unread_chat_messages" })
        : { value: localStorage.getItem("unread_chat_messages") };

      const parsed = result.value ? parseInt(result.value, 10) : 0;
      setUnreadChatsCount?.(parsed);
    };

    fetchStorage();
  }, [isMenuOpen, setUnreadChatsCount]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", async (message) => {
      if (message.profileId !== profileId) {
        socket.emit("getUnreadChatsCount");
      }
    });

    socket.on("unreadChatsCount", async (data) => {
      setUnreadChatsCount?.(data.count);
      isMobile
        ? await Preferences.set({ key: "unread_chat_messages", value: data.count.toString() })
        : localStorage.setItem("unread_chat_messages", data.count.toString());
    });

    return () => {
      socket.off("newMessage");
      socket.off("unreadChatsCount");
    };
  }, [socket, profileId, isMobile, setUnreadChatsCount]);

  if (!unreadChatsCount || unreadChatsCount <= 0) return null;

  return (
    <div className="absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs rotate-270">
      {unreadChatsCount}
    </div>
  );
};
