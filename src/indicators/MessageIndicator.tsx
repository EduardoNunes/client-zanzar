import { useEffect, useState } from "react";
import { SOCKET_URL } from "../server/socket";
import { Preferences } from "@capacitor/preferences";
import { io, Socket } from "socket.io-client";
import { useGlobalContext } from "../context/globalContext";

interface MessageIndicatorProps {
  isMenuOpen?: boolean;
  unreadChatsCount?: number;
  setUnreadChatsCount?: (count: number) => void;
}

export const MessageIndicator: React.FC<MessageIndicatorProps> = ({
  isMenuOpen,
  unreadChatsCount,
  setUnreadChatsCount,
}) => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const { profileId } = useGlobalContext();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchMessagesStorage = async () => {
      let messagesStorage;

      if (isMobile) {
        const result = await Preferences.get({ key: "unread_chat_messages" });
        messagesStorage = result.value;
      } else {
        messagesStorage = localStorage.getItem("unread_chat_messages");
      }

      if (setUnreadChatsCount) {
        const parsedValue = messagesStorage ? parseInt(messagesStorage, 10) : 0;

        setUnreadChatsCount(parsedValue);
      }
    };

    fetchMessagesStorage();
  }, [isMenuOpen, setUnreadChatsCount, unreadChatsCount]);

  useEffect(() => {
    if (profileId) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: profileId },
      });

      newSocket.on("connect", () => {});

      newSocket.on("connect_error", (error) => {
        console.error("ERRO NA CONEXÃO DO SOCKET:", error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [profileId]);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", async (message) => {
        // Verificar se a mensagem é para o usuário atual
        if (message.profileId !== profileId) {
          // Emitir evento para obter o número de chats não lidos
          socket.emit("getUnreadChatsCount");
        }
      });

      // Listener para o evento unreadChatsCount
      socket.on("unreadChatsCount", async (data) => {
        if (setUnreadChatsCount) {
          setUnreadChatsCount(data.count);
          if (isMobile) {
            await Preferences.set({
              key: "unread_chat_messages",
              value: data.count.toString(),
            });
          } else {
            localStorage.setItem("unread_chat_messages", data.count.toString());
          }
        }
      });
    }
    return () => {
      if (socket) {
        socket.off("newMessage");
        socket.off("unreadChatsCount");
      }
    };
  }, [socket, isMobile, setUnreadChatsCount, profileId]);

  if (!unreadChatsCount || unreadChatsCount <= 0) {
    return null;
  }

  return (
    <div className="absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs rotate-270">
      {unreadChatsCount}
    </div>
  );
};
