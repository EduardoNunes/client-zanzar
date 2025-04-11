import { Preferences } from "@capacitor/preferences";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useGlobalContext } from "../context/globalContext";
import { SOCKET_URL } from "../server/socket";

interface InvitesIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  unreadInvites?: number;
  setUnreadInvites?: React.Dispatch<React.SetStateAction<number>>;
}

export function InvitesIndicator({
  className,
  isMenuOpen,
  unreadInvites = 0,
  setUnreadInvites,
}: InvitesIndicatorProps) {
  const { profileId, token } = useGlobalContext();

  useEffect(() => {
    const fetchUnreadInvites = async () => {
      let invitesStorage;

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const result = await Preferences.get({ key: "invites" });
        invitesStorage = result.value;
      } else {
        invitesStorage = localStorage.getItem("invites");
      }

      if (setUnreadInvites) {
        const parsedValue = invitesStorage ? parseInt(invitesStorage, 10) : 0;
        setUnreadInvites(parsedValue);
      }
    };

    fetchUnreadInvites();
  }, [isMenuOpen, setUnreadInvites]);

  useEffect(() => {
    if (!token || !profileId) return;

    // Inicializar socket
    const newSocket = io(SOCKET_URL, {
      query: { userId: profileId },
    });

    // Ouvir novas convites
    newSocket.on("get-unread-invites", async () => {
      const newUnreadCount = (unreadInvites ?? 0) + 1;
      console.log("NEW SOCKET", newSocket);
      if (setUnreadInvites) {
        setUnreadInvites(newUnreadCount);
      }

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await Preferences.set({
          key: "invites",
          value: newUnreadCount.toString(),
        });
      } else {
        localStorage.setItem("invites", newUnreadCount.toString());
      }
    });

    // Ouvir resposta da contagem de convites não lidos
    newSocket.on("unread-invites-count", async (data: { invites: number }) => {
      if (setUnreadInvites) {
        setUnreadInvites(data.invites);
      }
      console.log("DATA", data.invites);
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await Preferences.set({
          key: "invites",
          value: data.invites.toString(),
        });
      } else {
        localStorage.setItem("invites", data.invites.toString());
      }
    });

    newSocket.emit("get-unread-invites", profileId);

    return () => {
      newSocket.disconnect();
    };
  }, [token, profileId, setUnreadInvites, isMenuOpen]);

  if (unreadInvites === 0) return null;

  return (
    <div
      className={`absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs ${className}`}
      style={{
        transition: "transform 0.3s ease-in-out",
        transform: "rotate(270deg)",
      }}
    >
      {unreadInvites}
    </div>
  );
}
